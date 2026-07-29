import DemandaItem from './DemandaItem'

export default function DemandaList({
  demandas,
  salas,
  usuarios,
  carregando,
  onAtualizarStatus,
  onAtribuirResponsavel,
  onEditar,
  onExcluir,
}) {
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
          usuarios={usuarios}
          onAtualizarStatus={onAtualizarStatus}
          onAtribuirResponsavel={onAtribuirResponsavel}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </ul>
  )
}
