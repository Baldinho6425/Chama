import { useEffect, useState } from 'react'
import { adicionarComentario, listarHistorico } from '../api'
import { STATUS } from '../statusDemanda'
import { formatarData } from '../formatarData'

function descreverEntrada(entrada) {
  switch (entrada.tipo) {
    case 'criacao':
      return 'criou a demanda'
    case 'status':
      return `mudou o status de "${STATUS[entrada.status_anterior]?.rotulo ?? entrada.status_anterior}" para "${STATUS[entrada.status_novo]?.rotulo ?? entrada.status_novo}"`
    case 'responsavel':
      return entrada.texto
    default:
      return entrada.texto ?? ''
  }
}

export default function Historico({ demandaId }) {
  const [entradas, setEntradas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const dados = await listarHistorico(demandaId)
        if (!cancelado) setEntradas(dados)
      } catch (err) {
        if (!cancelado) setErro(err.message)
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [demandaId])

  async function handleComentar(e) {
    e.preventDefault()
    if (!comentario.trim()) return

    setEnviando(true)
    setErro(null)
    try {
      const nova = await adicionarComentario(demandaId, comentario)
      setEntradas((atual) => [...atual, nova])
      setComentario('')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="historico">
      {carregando ? (
        <p className="mensagem-vazia">Carregando histórico…</p>
      ) : entradas.length === 0 ? (
        <p className="mensagem-vazia">Sem atividade registrada ainda.</p>
      ) : (
        <ul className="historico-lista">
          {entradas.map((entrada) => (
            <li key={entrada.id} className="historico-item">
              {entrada.tipo === 'comentario' ? (
                <p className="historico-comentario">
                  <strong>{entrada.usuario_nome}:</strong> {entrada.texto}
                </p>
              ) : (
                <p className="historico-evento">
                  <strong>{entrada.usuario_nome}</strong> {descreverEntrada(entrada)}
                </p>
              )}
              <span className="historico-data">{formatarData(entrada.criado_em)}</span>
            </li>
          ))}
        </ul>
      )}

      {erro && <p className="mensagem-erro">{erro}</p>}

      <form className="historico-form" onSubmit={handleComentar}>
        <input
          type="text"
          placeholder="Adicionar um comentário…"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <button type="submit" disabled={enviando || !comentario.trim()}>
          Enviar
        </button>
      </form>
    </div>
  )
}
