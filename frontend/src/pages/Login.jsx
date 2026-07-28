import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const { entrar, registrar } = useAuth()
  const [modo, setModo] = useState('login')
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)

  function atualizarCampo(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      if (modo === 'login') {
        await entrar(campos.email, campos.senha)
      } else {
        await registrar(campos.nome, campos.email, campos.senha)
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Chama</h1>
        <p className="login-subtitulo">
          {modo === 'login' ? 'Entrar na sua conta' : 'Criar uma conta'}
        </p>

        {modo === 'registro' && (
          <div className="campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={campos.nome}
              onChange={(e) => atualizarCampo('nome', e.target.value)}
              required
            />
          </div>
        )}

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={campos.email}
            onChange={(e) => atualizarCampo('email', e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={campos.senha}
            onChange={(e) => atualizarCampo('senha', e.target.value)}
            minLength={6}
            required
          />
        </div>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Aguarde…' : modo === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>

        <button
          type="button"
          className="link-alternar"
          onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
        >
          {modo === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  )
}
