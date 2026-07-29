import { useState } from 'react'
import { redefinirSenha } from '../api'

export default function RedefinirSenha({ token }) {
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    try {
      await redefinirSenha(token, senha)
      setSucesso(true)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (sucesso) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Chama</h1>
          <p className="login-subtitulo">Senha redefinida com sucesso.</p>
          <a className="link-alternar" href="/">
            Ir para o login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Chama</h1>
        <p className="login-subtitulo">Escolha uma nova senha</p>

        <div className="campo">
          <label htmlFor="senha">Nova senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="confirmacao">Confirmar nova senha</label>
          <input
            id="confirmacao"
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            minLength={6}
            required
          />
        </div>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  )
}
