import { useState } from 'react'
import { ORDEM_PRIORIDADE, ORDEM_STATUS, PRIORIDADE, STATUS } from '../statusDemanda'
import { tempoRelativo } from '../formatarData'
import { IconeComentario, IconeMais, IconePorta, IconePredio } from './Icons'
import SelecionarSala from './SelecionarSala'
import Historico from './Historico'
import Avatar from './Avatar'

function MenuAcoes({ demanda, usuarios, onAtribuirResponsavel, onEditar, onExcluir }) {
  const [aberto, setAberto] = useState(false)

  function fechar(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setAberto(false)
  }

  return (
    <div className="menu-acoes" onBlur={fechar}>
      <button
        type="button"
        className="botao-menu"
        onClick={() => setAberto((a) => !a)}
        aria-label="Mais ações"
      >
        <IconeMais />
      </button>

      {aberto && (
        <div className="menu-acoes-dropdown">
          <label className="menu-acoes-rotulo" htmlFor={`responsavel-${demanda.id}`}>
            Responsável
          </label>
          <select
            id={`responsavel-${demanda.id}`}
            value={demanda.responsavel_id ?? ''}
            onChange={(e) => {
              onAtribuirResponsavel(e.target.value ? Number(e.target.value) : null)
              setAberto(false)
            }}
          >
            <option value="">Sem responsável</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setAberto(false)
              onEditar()
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="menu-acoes-excluir"
            onClick={() => {
              setAberto(false)
              onExcluir()
            }}
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}

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
  const [descricaoAberta, setDescricaoAberta] = useState(false)
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

  const pessoaPrincipal = demanda.responsavel_nome
    ? { rotulo: 'Responsável', nome: demanda.responsavel_nome }
    : demanda.criado_por_nome
      ? { rotulo: 'Aberto por', nome: demanda.criado_por_nome }
      : null

  return (
    <li className={`demanda-card demanda-card-${demanda.prioridade ?? 'normal'}`}>
      <div className="demanda-card-topo">
        <span className={`status-badge ${STATUS[demanda.status].classe}`}>
          <span className="status-ponto-inline" />
          {STATUS[demanda.status].rotulo}
        </span>
        <span className="demanda-tempo">{tempoRelativo(demanda.criado_em)}</span>
      </div>

      <p
        className="demanda-titulo"
        onClick={() => setDescricaoAberta((a) => !a)}
        role="button"
        tabIndex={0}
      >
        {demanda.observacoes}
      </p>
      {descricaoAberta && <p className="demanda-observacoes">{demanda.observacoes}</p>}

      <div className="demanda-card-meta">
        <span className="demanda-local">
          <IconePredio /> Bloco {demanda.bloco} <span className="demanda-local-sep">·</span>{' '}
          <IconePorta /> Sala {demanda.sala}
        </span>
        <span className={`prioridade-badge ${prioridade.classe}`}>{prioridade.rotulo}</span>
      </div>

      {pessoaPrincipal && (
        <div className="demanda-card-pessoas">
          <span className="demanda-pessoa">
            <Avatar nome={pessoaPrincipal.nome} tamanho={22} />
            {pessoaPrincipal.rotulo}: {pessoaPrincipal.nome}
          </span>
        </div>
      )}

      <div className="demanda-card-rodape">
        <button
          type="button"
          className="botao-comentarios"
          onClick={() => setHistoricoAberto((atual) => !atual)}
        >
          <IconeComentario /> {demanda.total_comentarios ?? 0}
        </button>

        <select
          className={`select-status ${STATUS[demanda.status].classe}`}
          value={demanda.status}
          onChange={(e) => onAtualizarStatus(demanda.id, e.target.value)}
        >
          {ORDEM_STATUS.map((status) => (
            <option key={status} value={status}>
              {STATUS[status].rotulo}
            </option>
          ))}
        </select>

        <MenuAcoes
          demanda={demanda}
          usuarios={usuarios}
          onAtribuirResponsavel={(id) => onAtribuirResponsavel(demanda.id, id)}
          onEditar={() => setEditando(true)}
          onExcluir={() => onExcluir(demanda.id)}
        />
      </div>

      {historicoAberto && <Historico demandaId={demanda.id} />}
    </li>
  )
}
