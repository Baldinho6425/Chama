import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { esqueciSenha } from '../api'
import { IconeCadeado, IconeEmail, IconeOlho, IconeOlhoFechado, IconePessoa } from '../components/Icons'

export default function Login() {
  const { entrar, registrar } = useAuth()
  const [modo, setModo] = useState('login')
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '', confirmacaoSenha: '' })
  const [lembrar, setLembrar] = useState(true)
  const [senhaVisivel, setSenhaVisivel] = useState(false)
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

    if (modo === 'registro' && campos.senha !== campos.confirmacaoSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)

    try {
      if (modo === 'login') {
        await entrar(campos.email, campos.senha, lembrar)
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
    login: 'Bem-vindo de volta!',
    registro: 'Criar conta',
    esqueci: 'Recuperar senha',
  }

  const subtitulos = {
    login: 'Faça login para acessar sua conta.',
    registro: 'Preencha os dados abaixo para se cadastrar.',
    esqueci: 'Informe seu email para receber o link de redefinição.',
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>
          <span aria-hidden="true">🔥</span> Chama
        </h1>
        <p className="login-titulo">{titulos[modo]}</p>
        <p className="login-subtitulo">{subtitulos[modo]}</p>

        {modo === 'registro' && (
          <div className="campo">
            <label htmlFor="nome">Nome completo</label>
            <div className="campo-com-icone">
              <IconePessoa className="campo-icone" />
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={campos.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="campo">
          <label htmlFor="email">Email</label>
          <div className="campo-com-icone">
            <IconeEmail className="campo-icone" />
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={campos.email}
              onChange={(e) => atualizarCampo('email', e.target.value)}
              required
            />
          </div>
        </div>

        {modo !== 'esqueci' && (
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <div className="campo-com-icone">
              <IconeCadeado className="campo-icone" />
              <input
                id="senha"
                type={senhaVisivel ? 'text' : 'password'}
                value={campos.senha}
                onChange={(e) => atualizarCampo('senha', e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="campo-icone-botao"
                onClick={() => setSenhaVisivel((v) => !v)}
                aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {senhaVisivel ? <IconeOlhoFechado /> : <IconeOlho />}
              </button>
            </div>
          </div>
        )}

        {modo === 'registro' && (
          <div className="campo">
            <label htmlFor="confirmacaoSenha">Confirmar senha</label>
            <div className="campo-com-icone">
              <IconeCadeado className="campo-icone" />
              <input
                id="confirmacaoSenha"
                type={senhaVisivel ? 'text' : 'password'}
                value={campos.confirmacaoSenha}
                onChange={(e) => atualizarCampo('confirmacaoSenha', e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>
        )}

        {modo === 'login' && (
          <div className="login-linha-opcoes">
            <label className="login-lembrar">
              <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
              Lembrar-me
            </label>
            <button type="button" className="link-alternar" onClick={() => trocarModo('esqueci')}>
              Esqueci minha senha
            </button>
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
          <p className="login-rodape">
            Não tem conta?{' '}
            <button type="button" className="link-alternar" onClick={() => trocarModo('registro')}>
              Cadastre-se
            </button>
          </p>
        )}

        {modo !== 'login' && (
          <p className="login-rodape">
            Já tem uma conta?{' '}
            <button type="button" className="link-alternar" onClick={() => trocarModo('login')}>
              Faça login
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
