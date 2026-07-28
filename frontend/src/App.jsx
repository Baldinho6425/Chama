import { useEffect, useState } from 'react'
import './App.css'
import DemandaForm from './components/DemandaForm'
import DemandaList from './components/DemandaList'
import SalasManager from './components/SalasManager'
import Dashboard from './components/Dashboard'
import Login from './pages/Login'
import {
  atualizarDemanda,
  criarDemanda,
  criarSala,
  excluirDemanda,
  excluirSala,
  listarDemandas,
  listarSalas,
} from './api'
import { ORDEM_STATUS, STATUS } from './statusDemanda'
import { useAuth } from './auth/AuthContext'
import { ativarNotificacoes, statusNotificacoes } from './push'

const ABAS = [
  { id: 'demandas', rotulo: 'Demandas' },
  { id: 'salas', rotulo: 'Salas' },
  { id: 'painel', rotulo: 'Painel' },
]

export default function App() {
  const { usuario, carregando: carregandoSessao, sair } = useAuth()

  if (carregandoSessao) {
    return <p className="mensagem-vazia">Carregando…</p>
  }

  if (!usuario) {
    return <Login />
  }

  return <AppAutenticado usuario={usuario} onSair={sair} />
}

function AppAutenticado({ usuario, onSair }) {
  const [aba, setAba] = useState('demandas')
  const [demandas, setDemandas] = useState([])
  const [salas, setSalas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [statusPush, setStatusPush] = useState('verificando')

  async function carregar() {
    setCarregando(true)
    setErro(null)
    try {
      const [dadosDemandas, dadosSalas] = await Promise.all([listarDemandas(), listarSalas()])
      setDemandas(dadosDemandas)
      setSalas(dadosSalas)
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

  const demandasFiltradas =
    filtro === 'todas' ? demandas : demandas.filter((d) => d.status === filtro)

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
          {ABAS.map((item) => (
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
              <div className="filtros">
                <button
                  className={filtro === 'todas' ? 'ativo' : ''}
                  onClick={() => setFiltro('todas')}
                >
                  Todas
                </button>
                {ORDEM_STATUS.map((status) => (
                  <button
                    key={status}
                    className={filtro === status ? 'ativo' : ''}
                    onClick={() => setFiltro(status)}
                  >
                    {STATUS[status].rotulo}
                  </button>
                ))}
              </div>

              <DemandaList
                demandas={demandasFiltradas}
                salas={salas}
                carregando={carregando}
                onAtualizarStatus={handleAtualizarStatus}
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
      </main>
    </div>
  )
}
