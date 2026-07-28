import { useState } from 'react'
import { ORDEM_PRIORIDADE, PRIORIDADE } from '../statusDemanda'
import SelecionarSala from './SelecionarSala'

const CAMPOS_VAZIOS = { bloco: '', sala: '', observacoes: '', prioridade: 'normal' }

export default function DemandaForm({ salas, onCriar }) {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function atualizarCampo(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }))
  }

  function handleChangeBloco(bloco) {
    setCampos((atual) => ({ ...atual, bloco, sala: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!campos.bloco || !campos.sala || !campos.observacoes.trim()) {
      setErro('Preencha bloco, sala e observações.')
      return
    }

    setErro(null)
    setEnviando(true)
    try {
      await onCriar(campos)
      setCampos(CAMPOS_VAZIOS)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="demanda-form" onSubmit={handleSubmit}>
      <h2>Nova demanda</h2>

      <div className="campo-linha">
        <SelecionarSala
          salas={salas}
          bloco={campos.bloco}
          sala={campos.sala}
          onChangeBloco={handleChangeBloco}
          onChangeSala={(sala) => atualizarCampo('sala', sala)}
        />

        {salas.length > 0 && (
          <div className="campo campo-prioridade">
            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
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
        )}
      </div>

      <div className="campo">
        <label htmlFor="observacoes">Observações</label>
        <textarea
          id="observacoes"
          placeholder="O que precisa ser feito na sala?"
          rows={3}
          value={campos.observacoes}
          onChange={(e) => atualizarCampo('observacoes', e.target.value)}
        />
      </div>

      {erro && <p className="mensagem-erro">{erro}</p>}

      <button type="submit" disabled={enviando || salas.length === 0}>
        {enviando ? 'Salvando…' : 'Cadastrar demanda'}
      </button>
    </form>
  )
}
