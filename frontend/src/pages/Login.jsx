import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { esqueciSenha } from '../api'

export default function Login() {
  const { entrar, registrar } = useAuth()
  const [modo, setModo] = useState('login')
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  function atualizarCampo(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }))
  }

  function trocarModo(novoModo) {
    setModo(novoModo)
    setErro(null)
    setMensagem(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro(null)
    setMensagem(null)
    setEnviando(true)

    try {
      if (modo === 'login') {
        await entrar(campos.email, campos.senha)
      } else if (modo === 'registro') {
        await registrar(campos.nome, campos.email, campos.senha)
      } else {
        const { mensagem } = await esqueciSenha(campos.email)
        setMensagem(mensagem)
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const titulos = {
    login: 'Entrar na sua conta',
    registro: 'Criar uma conta',
    esqueci: 'Recuperar senha',
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Chama</h1>
        <p className="login-subtitulo">{titulos[modo]}</p>

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

        {modo !== 'esqueci' && (
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
        )}

        {erro && <p className="mensagem-erro">{erro}</p>}
        {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

        <button type="submit" disabled={enviando}>
          {enviando
            ? 'Aguarde…'
            : modo === 'login'
              ? 'Entrar'
              : modo === 'registro'
                ? 'Cadastrar'
                : 'Enviar link de redefinição'}
        </button>

        {modo === 'login' && (
          <>
            <button type="button" className="link-alternar" onClick={() => trocarModo('registro')}>
              Não tem conta? Cadastre-se
            </button>
            <button type="button" className="link-alternar" onClick={() => trocarModo('esqueci')}>
              Esqueci minha senha
            </button>
          </>
        )}

        {modo !== 'login' && (
          <button type="button" className="link-alternar" onClick={() => trocarModo('login')}>
            Voltar para o login
          </button>
        )}
      </form>
    </div>
  )
}
