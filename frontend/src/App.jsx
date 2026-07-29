import { useEffect, useMemo, useState } from 'react'
import './App.css'
import DemandaForm from './components/DemandaForm'
import DemandaList from './components/DemandaList'
import SalasManager from './components/SalasManager'
import Dashboard from './components/Dashboard'
import UsuariosManager from './components/UsuariosManager'
import Login from './pages/Login'
import RedefinirSenha from './pages/RedefinirSenha'
import {
  atualizarDemanda,
  criarDemanda,
  criarSala,
  excluirDemanda,
  excluirSala,
  listarDemandas,
  listarSalas,
  listarUsuarios,
} from './api'
import { ORDEM_STATUS, STATUS } from './statusDemanda'
import { useAuth } from './auth/AuthContext'
import { ativarNotificacoes, statusNotificacoes } from './push'

const ABAS = [
  { id: 'demandas', rotulo: 'Demandas' },
  { id: 'salas', rotulo: 'Salas' },
  { id: 'painel', rotulo: 'Painel' },
]

const RANK_PRIORIDADE = { urgente: 0, normal: 1, baixa: 2 }

const ORDENACOES = [
  { id: 'recente', rotulo: 'Mais recente' },
  { id: 'antiga', rotulo: 'Mais antiga' },
  { id: 'prioridade', rotulo: 'Prioridade' },
  { id: 'bloco', rotulo: 'Bloco' },
]

export default function App() {
  const { usuario, carregando: carregandoSessao, sair } = useAuth()
  const tokenReset = new URLSearchParams(window.location.search).get('redefinir')

  if (tokenReset) {
    return <RedefinirSenha token={tokenReset} />
  }

  if (carregandoSessao) {
    return <p className="mensagem-vazia">Carregando…</p>
  }

  if (!usuario) {
    return <Login />
  }

  return <AppAutenticado usuario={usuario} onSair={sair} />
}

function AppAutenticado({ usuario, onSair }) {
  const ehSupervisor = usuario.papel === 'supervisor'
  const abas = ehSupervisor ? [...ABAS, { id: 'usuarios', rotulo: 'Usuários' }] : ABAS

  const [aba, setAba] = useState('demandas')
  const [demandas, setDemandas] = useState([])
  const [salas, setSalas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [filtro, setFiltro] = useState('pendente')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState('recente')
  const [statusPush, setStatusPush] = useState('verificando')

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      const [dadosDemandas, dadosSalas, dadosUsuarios] = await Promise.all([
        listarDemandas(),
        listarSalas(),
        listarUsuarios(),
      ])
      setDemandas(dadosDemandas)
      setSalas(dadosSalas)
      setUsuarios(dadosUsuarios)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    statusNotificacoes().then(setStatusPush)
  }, [])

  async function handleCriar(campos) {
    const nova = await criarDemanda(campos)
    setDemandas((atual) => [nova, ...atual])
  }

  async function handleAtualizarStatus(id, status) {
    const atualizada = await atualizarDemanda(id, { status })
    setDemandas((atual) => atual.map((d) => (d.id === id ? atualizada : d)))
  }

  async function handleAtribuirResponsavel(id, responsavelId) {
    const atualizada = await atualizarDemanda(id, { responsavelId })
    setDemandas((atual) => atual.map((d) => (d.id === id ? atualizada : d)))
  }

  async function handleEditar(id, campos) {
    const atualizada = await atualizarDemanda(id, campos)
    setDemandas((atual) => atual.map((d) => (d.id === id ? atualizada : d)))
  }

  async function handleExcluir(id) {
    if (!confirm('Excluir esta demanda?')) return
    await excluirDemanda(id)
    setDemandas((atual) => atual.filter((d) => d.id !== id))
  }

  async function handleCriarSala(campos) {
    const nova = await criarSala(campos)
    setSalas((atual) => [...atual, nova])
  }

  async function handleExcluirSala(id) {
    if (!confirm('Excluir esta sala?')) return
    await excluirSala(id)
    setSalas((atual) => atual.filter((s) => s.id !== id))
  }

  async function handleAtivarPush() {
    try {
      await ativarNotificacoes()
      setStatusPush('ativo')
    } catch (err) {
      alert(err.message)
    }
  }

  const demandasFiltradas = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase()

    return demandas
      .filter((d) => filtro === 'todas' || d.status === filtro)
      .filter((d) => {
        if (!buscaNormalizada) return true
        const alvo = `${d.bloco} ${d.sala} ${d.observacoes}`.toLowerCase()
        return alvo.includes(buscaNormalizada)
      })
      .sort((a, b) => {
        switch (ordenacao) {
          case 'antiga':
            return a.criado_em.localeCompare(b.criado_em)
          case 'prioridade':
            return (
              RANK_PRIORIDADE[a.prioridade ?? 'normal'] - RANK_PRIORIDADE[b.prioridade ?? 'normal']
            )
          case 'bloco':
            return a.bloco.localeCompare(b.bloco) || a.sala.localeCompare(b.sala)
          case 'recente':
          default:
            return b.criado_em.localeCompare(a.criado_em)
        }
      })
  }, [demandas, filtro, busca, ordenacao])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-topo">
          <div>
            <h1>Chama</h1>
            <p>Demandas de TI por sala</p>
          </div>
          <div className="app-header-usuario">
            <span>{usuario.nome}</span>
            <button type="button" className="botao-secundario" onClick={onSair}>
              Sair
            </button>
          </div>
        </div>

        {statusPush === 'inativo' && (
          <button type="button" className="botao-notificacoes" onClick={handleAtivarPush}>
            Ativar notificações
          </button>
        )}
        {statusPush === 'negado' && (
          <p className="mensagem-aviso">
            Notificações bloqueadas no navegador. Ative nas configurações do site para receber
            avisos de novas demandas.
          </p>
        )}

        <nav className="abas">
          {abas.map((item) => (
            <button
              key={item.id}
              className={aba === item.id ? 'ativo' : ''}
              onClick={() => setAba(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {erro && <p className="mensagem-erro">{erro}</p>}

        {aba === 'demandas' && (
          <>
            <DemandaForm salas={salas} onCriar={handleCriar} />

            <section className="secao-lista">
              <div className="controles-lista">
                <input
                  type="search"
                  className="campo-busca"
                  placeholder="Buscar por bloco, sala ou observação…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
                  {ORDENACOES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtros">
                {ORDEM_STATUS.map((status) => (
                  <button
                    key={status}
                    className={filtro === status ? 'ativo' : ''}
                    onClick={() => setFiltro(status)}
                  >
                    {STATUS[status].rotulo}
                  </button>
                ))}
                <button
                  className={filtro === 'todas' ? 'ativo' : ''}
                  onClick={() => setFiltro('todas')}
                >
                  Todas
                </button>
              </div>

              <DemandaList
                demandas={demandasFiltradas}
                salas={salas}
                usuarios={usuarios}
                carregando={carregando}
                onAtualizarStatus={handleAtualizarStatus}
                onAtribuirResponsavel={handleAtribuirResponsavel}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
              />
            </section>
          </>
        )}

        {aba === 'salas' && (
          <SalasManager salas={salas} onCriar={handleCriarSala} onExcluir={handleExcluirSala} />
        )}

        {aba === 'painel' && <Dashboard demandas={demandas} />}

        {aba === 'usuarios' && ehSupervisor && <UsuariosManager />}
      </main>
    </div>
  )
}
