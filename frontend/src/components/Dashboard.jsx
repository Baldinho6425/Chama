import { ORDEM_PRIORIDADE, ORDEM_STATUS, PRIORIDADE, STATUS } from '../statusDemanda'

function formatarDuracao(horas) {
  if (horas < 1) return '< 1 h'
  if (horas < 48) return `${Math.round(horas)} h`
  return `${(horas / 24).toFixed(1)} dias`
}

export default function Dashboard({ demandas }) {
  const total = demandas.length

  if (total === 0) {
    return <p className="mensagem-vazia">Cadastre demandas para ver o painel de estatísticas.</p>
  }

  const porStatus = ORDEM_STATUS.map((status) => ({
    status,
    total: demandas.filter((d) => d.status === status).length,
  }))

  const porPrioridade = ORDEM_PRIORIDADE.map((prioridade) => ({
    prioridade,
    total: demandas.filter((d) => (d.prioridade ?? 'normal') === prioridade).length,
  }))

  const contagemPorBloco = Object.entries(
    demandas.reduce((acc, d) => {
      acc[d.bloco] = (acc[d.bloco] ?? 0) + 1
      return acc
    }, {})
  )
    .map(([bloco, total]) => ({ bloco, total }))
    .sort((a, b) => b.total - a.total)

  const maiorContagemBloco = Math.max(1, ...contagemPorBloco.map((b) => b.total))

  const concluidas = demandas.filter((d) => d.status === 'concluida')
  const tempoMedioHoras =
    concluidas.length === 0
      ? null
      : concluidas.reduce((soma, d) => {
          const inicio = new Date(d.criado_em).getTime()
          const fim = new Date(d.atualizado_em).getTime()
          return soma + (fim - inicio) / 3600000
        }, 0) / concluidas.length

  return (
    <section className="painel">
      <div className="painel-stats">
        <div className="stat-tile">
          <span className="stat-valor">{total}</span>
          <span className="stat-rotulo">Total de demandas</span>
        </div>
        {porStatus.map(({ status, total }) => (
          <div key={status} className={`stat-tile ${STATUS[status].classe}`}>
            <span className="stat-valor">{total}</span>
            <span className="stat-rotulo">{STATUS[status].rotulo}</span>
          </div>
        ))}
      </div>

      <div className="painel-secao">
        <h3>Por prioridade</h3>
        <div className="painel-chips">
          {porPrioridade.map(({ prioridade, total }) => (
            <span key={prioridade} className={`prioridade-badge ${PRIORIDADE[prioridade].classe}`}>
              {PRIORIDADE[prioridade].rotulo}: {total}
            </span>
          ))}
        </div>
      </div>

      <div className="painel-secao">
        <h3>Demandas por bloco</h3>
        <ul className="painel-barras">
          {contagemPorBloco.map(({ bloco, total }) => (
            <li key={bloco} className="painel-barra-linha">
              <span className="painel-barra-rotulo">Bloco {bloco}</span>
              <div className="painel-barra-trilha" title={`${total} demanda(s)`}>
                <div
                  className="painel-barra-preenchimento"
                  style={{ width: `${(total / maiorContagemBloco) * 100}%` }}
                />
              </div>
              <span className="painel-barra-valor">{total}</span>
            </li>
          ))}
        </ul>
      </div>

      {tempoMedioHoras !== null && (
        <div className="painel-secao">
          <h3>Tempo médio de conclusão</h3>
          <p className="stat-hero">{formatarDuracao(tempoMedioHoras)}</p>
        </div>
      )}
    </section>
  )
}
