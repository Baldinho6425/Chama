import { useState } from 'react'
import { ORDEM_PRIORIDADE, ORDEM_STATUS, PRIORIDADE, STATUS } from '../statusDemanda'
import { formatarData } from '../formatarData'
import SelecionarSala from './SelecionarSala'
import Historico from './Historico'

export default function DemandaItem({
  demanda,
  salas,
  usuarios,
  onAtualizarStatus,
  onAtribuirResponsavel,
  onEditar,
  onExcluir,
}) {
  const [editando, setEditando] = useState(false)
  const [historicoAberto, setHistoricoAberto] = useState(false)
  const [campos, setCampos] = useState({
    bloco: demanda.bloco,
    sala: demanda.sala,
    observacoes: demanda.observacoes,
    prioridade: demanda.prioridade ?? 'normal',
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  const prioridade = PRIORIDADE[demanda.prioridade ?? 'normal']

  function atualizarCampo(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }))
  }

  function atualizarBloco(bloco) {
    setCampos((atual) => ({ ...atual, bloco, sala: '' }))
  }

  async function salvarEdicao(e) {
    e.preventDefault()

    if (!campos.bloco || !campos.sala || !campos.observacoes.trim()) {
      setErro('Preencha bloco, sala e observações.')
      return
    }

    setErro(null)
    setSalvando(true)
    try {
      await onEditar(demanda.id, campos)
      setEditando(false)
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  if (editando) {
    return (
      <li className="demanda-card">
        <form className="demanda-form-edicao" onSubmit={salvarEdicao}>
          <div className="campo-linha">
            <SelecionarSala
              salas={salas}
              bloco={campos.bloco}
              sala={campos.sala}
              onChangeBloco={atualizarBloco}
              onChangeSala={(sala) => atualizarCampo('sala', sala)}
            />
            <div className="campo campo-prioridade">
              <label>Prioridade</label>
              <select
                value={campos.prioridade}
                onChange={(e) => atualizarCampo('prioridade', e.target.value)}
              >
                {ORDEM_PRIORIDADE.map((p) => (
                  <option key={p} value={p}>
                    {PRIORIDADE[p].rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="campo">
            <label>Observações</label>
            <textarea
              rows={3}
              value={campos.observacoes}
              onChange={(e) => atualizarCampo('observacoes', e.target.value)}
            />
          </div>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <div className="demanda-acoes">
            <button type="submit" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" className="botao-secundario" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="demanda-card">
      <div className="demanda-card-topo">
        <span className="demanda-local">
          Bloco {demanda.bloco} · Sala {demanda.sala}
        </span>
        <div className="demanda-badges">
          <span className={`prioridade-badge ${prioridade.classe}`}>{prioridade.rotulo}</span>
          <span className={`status-badge ${STATUS[demanda.status].classe}`}>
            {STATUS[demanda.status].rotulo}
          </span>
        </div>
      </div>

      <p className="demanda-observacoes">{demanda.observacoes}</p>

      <div className="demanda-card-rodape">
        <span className="demanda-data">
          Criada em {formatarData(demanda.criado_em)}
          {demanda.criado_por_nome ? ` por ${demanda.criado_por_nome}` : ''}
          {demanda.responsavel_nome ? ` · Responsável: ${demanda.responsavel_nome}` : ''}
        </span>

        <div className="demanda-acoes">
          <select
            value={demanda.status}
            onChange={(e) => onAtualizarStatus(demanda.id, e.target.value)}
          >
            {ORDEM_STATUS.map((status) => (
              <option key={status} value={status}>
                {STATUS[status].rotulo}
              </option>
            ))}
          </select>
          <select
            value={demanda.responsavel_id ?? ''}
            onChange={(e) =>
              onAtribuirResponsavel(demanda.id, e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Sem responsável</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
          <button type="button" className="botao-secundario" onClick={() => setEditando(true)}>
            Editar
          </button>
          <button type="button" className="botao-excluir" onClick={() => onExcluir(demanda.id)}>
            Excluir
          </button>
        </div>
      </div>

      <button
        type="button"
        className="botao-historico"
        onClick={() => setHistoricoAberto((atual) => !atual)}
      >
        {historicoAberto ? 'Ocultar histórico' : 'Ver histórico'}
      </button>

      {historicoAberto && <Historico demandaId={demanda.id} />}
    </li>
  )
}
