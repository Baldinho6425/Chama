import DemandaItem from './DemandaItem'

export default function DemandaList({ demandas, salas, carregando, onAtualizarStatus, onEditar, onExcluir }) {
  if (carregando) {
    return <p className="mensagem-vazia">Carregando demandas…</p>
  }

  if (demandas.length === 0) {
    return <p className="mensagem-vazia">Nenhuma demanda encontrada.</p>
  }

  return (
    <ul className="demanda-lista">
      {demandas.map((demanda) => (
        <DemandaItem
          key={demanda.id}
          demanda={demanda}
          salas={salas}
          onAtualizarStatus={onAtualizarStatus}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </ul>
  )
}
