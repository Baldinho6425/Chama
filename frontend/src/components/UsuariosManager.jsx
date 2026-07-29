import { useEffect, useState } from 'react'
import { atualizarUsuario, listarUsuariosGerenciar } from '../api'
import { formatarData } from '../formatarData'
import { useAuth } from '../auth/AuthContext'

export default function UsuariosManager() {
  const { usuario: usuarioAtual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      setUsuarios(await listarUsuariosGerenciar())
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

  if (carregando) {
    return <p className="mensagem-vazia">Carregando usuários…</p>
  }

  return (
    <section className="secao-usuarios">
      {erro && <p className="mensagem-erro">{erro}</p>}

      <ul className="usuarios-lista">
        {usuarios.map((u) => {
          const ehVocê = u.id === usuarioAtual.id
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
                <span className={`papel-badge ${u.papel === 'supervisor' ? 'papel-supervisor' : 'papel-comum'}`}>
                  {u.papel === 'supervisor' ? 'Supervisor' : 'Comum'}
                </span>
                <span className={`ativo-badge ${u.ativo ? 'ativo-sim' : 'ativo-nao'}`}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="usuario-acoes">
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
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
