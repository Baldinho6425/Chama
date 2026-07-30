import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import DemandaForm from './components/DemandaForm'
import DemandaList from './components/DemandaList'
import SalasManager from './components/SalasManager'
import Dashboard from './components/Dashboard'
import UsuariosManager from './components/UsuariosManager'
import Avatar from './components/Avatar'
import { IconeGrafico, IconeLista, IconeMenu, IconePessoas, IconePredio, IconeSino } from './components/Icons'
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
  listarSolicitacoesPendentes,
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

const ITENS_POR_PAGINA = 6

const ICONES_ABA = {
  demandas: IconeLista,
  salas: IconePredio,
  painel: IconeGrafico,
  usuarios: IconePessoas,
}

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
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [irParaForm, setIrParaForm] = useState(false)
  const [pendentesCount, setPendentesCount] = useState(0)
  const [menuContaAberto, setMenuContaAberto] = useState(false)
  const formRef = useRef(null)

  async function carregarPendentes() {
    if (!ehSupervisor) return
    try {
      const pendentes = await listarSolicitacoesPendentes()
      setPendentesCount(pendentes.length)
    } catch {
      // não é crítico para o resto do app
    }
  }

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
    carregarPendentes()
    statusNotificacoes().then(setStatusPush)
  }, [])

  useEffect(() => {
    setPaginaAtual(1)
  }, [filtro, busca, ordenacao])

  useEffect(() => {
    if (aba === 'demandas' && irParaForm) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIrParaForm(false)
    }
  }, [aba, irParaForm])

  function handleNovaDemandaClick() {
    setAba('demandas')
    setIrParaForm(true)
  }

  function handleSinoClick() {
    if (statusPush === 'inativo') handleAtivarPush()
  }

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

  const totalPaginas = Math.max(1, Math.ceil(demandasFiltradas.length / ITENS_POR_PAGINA))

  const demandasPaginadas = useMemo(
    () =>
      demandasFiltradas.slice(
        (paginaAtual - 1) * ITENS_POR_PAGINA,
        paginaAtual * ITENS_POR_PAGINA
      ),
    [demandasFiltradas, paginaAtual]
  )

  return (
    <div className="app-shell">
      <header className="topbar-mobile">
        <button
          type="button"
          className="botao-hamburguer"
          onClick={() => setMenuContaAberto(true)}
          aria-label="Abrir menu da conta"
        >
          <IconeMenu />
        </button>

        <span className="topbar-mobile-marca">
          <span aria-hidden="true">🔥</span> Chama
        </span>

        <div className="topbar-mobile-acoes">
          <button type="button" className="botao-sino" onClick={handleSinoClick} aria-label="Notificações">
            <IconeSino />
            {pendentesCount > 0 && <span className="sino-badge">{pendentesCount}</span>}
          </button>
          <button
            type="button"
            className="botao-avatar-conta"
            onClick={() => setMenuContaAberto(true)}
            aria-label="Abrir menu da conta"
          >
            <Avatar nome={usuario.nome} tamanho={34} online />
          </button>
        </div>
      </header>

      {menuContaAberto && (
        <div className="drawer-fundo" onClick={() => setMenuContaAberto(false)}>
          <div className="drawer-conta" onClick={(e) => e.stopPropagation()}>
            <Avatar nome={usuario.nome} tamanho={48} online />
            <span className="drawer-conta-nome">{usuario.nome}</span>
            {ehSupervisor && <span className="topbar-usuario-papel">Supervisor</span>}
            <button
              type="button"
              className="botao-secundario"
              onClick={() => {
                setMenuContaAberto(false)
                onSair()
              }}
            >
              Sair
            </button>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-marca">
          <span className="sidebar-logo" aria-hidden="true">
            🔥
          </span>
          <span>Chama</span>
        </div>

        <button type="button" className="botao-nova-demanda" onClick={handleNovaDemandaClick}>
          + Nova demanda
        </button>

        {aba === 'demandas' && (
          <div className="sidebar-filtros">
            <h3>Filtros</h3>

            <input
              type="search"
              className="campo-busca"
              placeholder="Buscar demandas…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <label className="sidebar-rotulo" htmlFor="ordenacao">
              Ordenar por
            </label>
            <select id="ordenacao" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              {ORDENACOES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.rotulo}
                </option>
              ))}
            </select>

            <span className="sidebar-rotulo">Status</span>
            <div className="sidebar-status-lista">
              {ORDEM_STATUS.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`sidebar-status-item ${filtro === status ? 'ativo' : ''}`}
                  onClick={() => setFiltro(status)}
                >
                  <span className={`status-ponto ${STATUS[status].classe}`} />
                  {STATUS[status].rotulo}
                </button>
              ))}
              <button
                type="button"
                className={`sidebar-status-item ${filtro === 'todas' ? 'ativo' : ''}`}
                onClick={() => setFiltro('todas')}
              >
                <span className="status-ponto status-ponto-todas" />
                Todas
              </button>
            </div>
          </div>
        )}

        {statusPush !== 'ativo' && (
          <div className="sidebar-notif-card">
            <p>Receba notificações sobre atualizações e novos comentários.</p>
            {statusPush === 'inativo' && (
              <button type="button" onClick={handleAtivarPush}>
                Gerenciar notificações
              </button>
            )}
            {statusPush === 'negado' && (
              <p className="mensagem-aviso">
                Bloqueadas no navegador. Ative nas configurações do site.
              </p>
            )}
          </div>
        )}
      </aside>

      <div className="app-content">
        <header className="topbar">
          <nav className="abas">
            {abas.map((item) => (
              <button
                key={item.id}
                className={aba === item.id ? 'ativo' : ''}
                onClick={() => setAba(item.id)}
              >
                {item.rotulo}
                {item.id === 'usuarios' && pendentesCount > 0 && (
                  <span className="aba-badge">{pendentesCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="topbar-usuario">
            {statusPush === 'ativo' && <span className="notif-ativa">🔔 Notificações ativas</span>}
            <Avatar nome={usuario.nome} tamanho={32} />
            <div className="topbar-usuario-info">
              <span>{usuario.nome}</span>
              {ehSupervisor && <span className="topbar-usuario-papel">Supervisor</span>}
            </div>
            <button type="button" className="botao-secundario" onClick={onSair}>
              Sair
            </button>
          </div>
        </header>

        <main className="app-main">
          {erro && <p className="mensagem-erro">{erro}</p>}

          {aba === 'demandas' && (
            <>
              <div ref={formRef}>
                <DemandaForm salas={salas} onCriar={handleCriar} />
              </div>

              <section className="secao-lista">
                <DemandaList
                  demandas={demandasPaginadas}
                  salas={salas}
                  usuarios={usuarios}
                  carregando={carregando}
                  onAtualizarStatus={handleAtualizarStatus}
                  onAtribuirResponsavel={handleAtribuirResponsavel}
                  onEditar={handleEditar}
                  onExcluir={handleExcluir}
                />

                {totalPaginas > 1 && (
                  <nav className="paginacao" aria-label="Paginação de demandas">
                    <button
                      type="button"
                      disabled={paginaAtual === 1}
                      onClick={() => setPaginaAtual((p) => p - 1)}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={paginaAtual === n ? 'ativo' : ''}
                        onClick={() => setPaginaAtual(n)}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={paginaAtual === totalPaginas}
                      onClick={() => setPaginaAtual((p) => p + 1)}
                    >
                      ›
                    </button>
                  </nav>
                )}
              </section>
            </>
          )}

          {aba === 'salas' && (
            <SalasManager salas={salas} onCriar={handleCriarSala} onExcluir={handleExcluirSala} />
          )}

          {aba === 'painel' && <Dashboard demandas={demandas} />}

          {aba === 'usuarios' && ehSupervisor && (
            <UsuariosManager onMudarSolicitacoes={carregarPendentes} />
          )}
        </main>
      </div>

      <nav className="bottom-nav">
        {abas.map((item) => {
          const Icone = ICONES_ABA[item.id]
          return (
            <button
              key={item.id}
              className={aba === item.id ? 'ativo' : ''}
              onClick={() => setAba(item.id)}
            >
              <span className="bottom-nav-icone">
                <Icone />
                {item.id === 'usuarios' && pendentesCount > 0 && (
                  <span className="aba-badge aba-badge-bottom">{pendentesCount}</span>
                )}
              </span>
              <span>{item.rotulo}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
