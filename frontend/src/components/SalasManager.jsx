import { useState } from 'react'

export default function SalasManager({ salas, onCriar, onExcluir }) {
  const [campos, setCampos] = useState({ bloco: '', sala: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function atualizarCampo(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!campos.bloco.trim() || !campos.sala.trim()) {
      setErro('Preencha bloco e sala.')
      return
    }

    setErro(null)
    setEnviando(true)
    try {
      await onCriar(campos)
      setCampos({ bloco: campos.bloco, sala: '' })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const salasPorBloco = salas.reduce((agrupado, s) => {
    ;(agrupado[s.bloco] ??= []).push(s)
    return agrupado
  }, {})

  return (
    <section className="secao-salas">
      <form className="demanda-form" onSubmit={handleSubmit}>
        <h2>Cadastrar sala</h2>

        <div className="campo-linha">
          <div className="campo">
            <label htmlFor="salas-bloco">Bloco</label>
            <input
              id="salas-bloco"
              type="text"
              placeholder="Ex: A"
              value={campos.bloco}
              onChange={(e) => atualizarCampo('bloco', e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="salas-sala">Sala</label>
            <input
              id="salas-sala"
              type="text"
              placeholder="Ex: 204"
              value={campos.sala}
              onChange={(e) => atualizarCampo('sala', e.target.value)}
            />
          </div>
        </div>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Cadastrar sala'}
        </button>
      </form>

      {Object.keys(salasPorBloco).length === 0 ? (
        <p className="mensagem-vazia">Nenhuma sala cadastrada ainda.</p>
      ) : (
        <div className="salas-grupos">
          {Object.entries(salasPorBloco).map(([bloco, itens]) => (
            <div key={bloco} className="salas-grupo">
              <h3>Bloco {bloco}</h3>
              <ul className="salas-lista">
                {itens.map((s) => (
                  <li key={s.id}>
                    <span>{s.sala}</span>
                    <button type="button" onClick={() => onExcluir(s.id)} aria-label={`Excluir sala ${s.sala}`}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
