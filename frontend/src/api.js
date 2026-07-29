const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'
const TOKEN_KEY = 'chama_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const corpo = await res.json().catch(() => ({}))
    throw new Error(corpo.erro || `Erro ${res.status}`)
  }

  return res.status === 204 ? null : res.json()
}

// Autenticação

export function registrar(dados) {
  return request('/auth/registrar', { method: 'POST', body: JSON.stringify(dados) })
}

export function login(dados) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(dados) })
}

export function buscarUsuarioAtual() {
  return request('/auth/me')
}

// Demandas

export function listarDemandas(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/demandas${query}`)
}

export function criarDemanda(dados) {
  return request('/demandas', { method: 'POST', body: JSON.stringify(dados) })
}

export function atualizarDemanda(id, dados) {
  return request(`/demandas/${id}`, { method: 'PATCH', body: JSON.stringify(dados) })
}

export function excluirDemanda(id) {
  return request(`/demandas/${id}`, { method: 'DELETE' })
}

// Salas

export function listarSalas() {
  return request('/salas')
}

export function criarSala(dados) {
  return request('/salas', { method: 'POST', body: JSON.stringify(dados) })
}

export function excluirSala(id) {
  return request(`/salas/${id}`, { method: 'DELETE' })
}

// Usuários

export function listarUsuarios() {
  return request('/usuarios')
}

export function listarUsuariosGerenciar() {
  return request('/usuarios/gerenciar')
}

export function atualizarUsuario(id, dados) {
  return request(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(dados) })
}

// Histórico

export function listarHistorico(demandaId) {
  return request(`/demandas/${demandaId}/historico`)
}

export function adicionarComentario(demandaId, texto) {
  return request(`/demandas/${demandaId}/historico`, {
    method: 'POST',
    body: JSON.stringify({ texto }),
  })
}

// Push

export function buscarChavePublicaPush() {
  return request('/push/vapid-public-key')
}

export function inscreverPush(subscricao) {
  return request('/push/subscribe', { method: 'POST', body: JSON.stringify(subscricao) })
}

export function cancelarInscricaoPush(endpoint) {
  return request('/push/subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint }) })
}
