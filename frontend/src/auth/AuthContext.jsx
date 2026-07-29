import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function restaurarSessao() {
      if (!api.getToken()) {
        setCarregando(false)
        return
      }

      try {
        const dados = await api.buscarUsuarioAtual()
        setUsuario(dados)
      } catch {
        api.setToken(null)
      } finally {
        setCarregando(false)
      }
    }

    restaurarSessao()
  }, [])

  async function entrar(email, senha, lembrar = true) {
    const { usuario, token } = await api.login({ email, senha })
    api.setToken(token, lembrar)
    setUsuario(usuario)
  }

  async function registrar(nome, email, senha) {
    const { usuario, token } = await api.registrar({ nome, email, senha })
    api.setToken(token)
    setUsuario(usuario)
  }

  function sair() {
    api.setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, registrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
