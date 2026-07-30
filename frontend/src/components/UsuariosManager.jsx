import { useEffect, useState } from 'react'
import { atualizarUsuario, listarSolicitacoesPendentes, listarUsuariosGerenciar } from '../api'
import { formatarData } from '../formatarData'
import { useAuth } from '../auth/AuthContext'
import Avatar from './Avatar'

export default function UsuariosManager({ onMudarSolicitacoes }) {
  const { usuario: usuarioAtual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [pendentes, setPendentes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      const [listaUsuarios, listaPendentes] = await Promise.all([
        listarUsuariosGerenciar(),
        listarSolicitacoesPendentes(),
      ])
      setUsuarios(listaUsuarios)
      setPendentes(listaPendentes)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleAlternarAtivo(u) {
    try {
      const atualizado = await atualizarUsuario(u.id, { ativo: !u.ativo })
      setUsuarios((atual) => atual.map((x) => (x.id === u.id ? atualizado : x)))
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleAlternarPapel(u) {
    const novoPapel = u.papel === 'supervisor' ? 'comum' : 'supervisor'
    try {
      const atualizado = await atualizarUsuario(u.id, { papel: novoPapel })
      setUsuarios((atual) => atual.map((x) => (x.id === u.id ? atualizado : x)))
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDecidirSolicitacao(id, statusCadastro) {
    try {
      const atualizado = await atualizarUsuario(id, { statusCadastro })
      setPendentes((atual) => atual.filter((u) => u.id !== id))
      setUsuarios((atual) => atual.map((u) => (u.id === id ? atualizado : u)))
      onMudarSolicitacoes?.()
    } catch (err) {
      alert(err.message)
    }
  }

  if (carregando) {
    return <p className="mensagem-vazia">Carregando usuários…</p>
  }

  const usuariosVisiveis = usuarios.filter((u) => u.status_cadastro !== 'pendente')

  return (
    <section className="secao-usuarios">
      {erro && <p className="mensagem-erro">{erro}</p>}

      <div className="solicitacoes-bloco">
        <h3>Solicitações pendentes{pendentes.length > 0 ? ` (${pendentes.length})` : ''}</h3>

        {pendentes.length === 0 ? (
          <p className="mensagem-vazia">Nenhuma solicitação pendente.</p>
        ) : (
          <ul className="usuarios-lista">
            {pendentes.map((u) => (
              <li key={u.id} className="usuario-card usuario-card-pendente">
                <div className="usuario-info">
                  <span className="usuario-nome">
                    <Avatar nome={u.nome} tamanho={26} /> {u.nome}
                  </span>
                  <span className="usuario-email">{u.email}</span>
                  <span className="usuario-data">Solicitado em {formatarData(u.criado_em)}</span>
                </div>

                <div className="usuario-acoes">
                  <button
                    type="button"
                    className="botao-aprovar"
                    onClick={() => handleDecidirSolicitacao(u.id, 'aprovado')}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    className="botao-excluir"
                    onClick={() => handleDecidirSolicitacao(u.id, 'rejeitado')}
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 className="usuarios-titulo-secao">Usuários</h3>

      <ul className="usuarios-lista">
        {usuariosVisiveis.map((u) => {
          const ehVocê = u.id === usuarioAtual.id
          const foiRecusado = u.status_cadastro === 'rejeitado'
          return (
            <li key={u.id} className="usuario-card">
              <div className="usuario-info">
                <span className="usuario-nome">
                  {u.nome} {ehVocê && <span className="usuario-voce">(você)</span>}
                </span>
                <span className="usuario-email">{u.email}</span>
                <span className="usuario-data">Desde {formatarData(u.criado_em)}</span>
              </div>

              <div className="usuario-badges">
                {foiRecusado ? (
                  <span className="ativo-badge ativo-nao">Recusado</span>
                ) : (
                  <>
                    <span className={`papel-badge ${u.papel === 'supervisor' ? 'papel-supervisor' : 'papel-comum'}`}>
                      {u.papel === 'supervisor' ? 'Supervisor' : 'Comum'}
                    </span>
                    <span className={`ativo-badge ${u.ativo ? 'ativo-sim' : 'ativo-nao'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </>
                )}
              </div>

              <div className="usuario-acoes">
                {foiRecusado ? (
                  <button
                    type="button"
                    className="botao-aprovar"
                    onClick={() => handleDecidirSolicitacao(u.id, 'aprovado')}
                  >
                    Aprovar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="botao-secundario"
                      disabled={ehVocê}
                      onClick={() => handleAlternarPapel(u)}
                    >
                      {u.papel === 'supervisor' ? 'Rebaixar' : 'Promover'}
                    </button>
                    <button
                      type="button"
                      className={u.ativo ? 'botao-excluir' : 'botao-secundario'}
                      disabled={ehVocê}
                      onClick={() => handleAlternarAtivo(u)}
                    >
                      {u.ativo ? 'Inativar' : 'Reativar'}
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
