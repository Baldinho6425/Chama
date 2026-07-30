const CORES = ['#1d4ed8', '#7c3aed', '#0891b2', '#ea580c', '#059669', '#db2777', '#4f46e5', '#b45309']

function corPara(nome) {
  const hash = [...nome].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return CORES[hash % CORES.length]
}

function iniciais(nome) {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export default function Avatar({ nome, tamanho = 28, online = false }) {
  if (!nome) return null

  return (
    <span className="avatar-wrapper" style={{ width: tamanho, height: tamanho }}>
      <span
        className="avatar"
        style={{
          width: tamanho,
          height: tamanho,
          fontSize: Math.max(10, tamanho * 0.4),
          background: corPara(nome),
        }}
        title={nome}
      >
        {iniciais(nome)}
      </span>
      {online && <span className="avatar-online" />}
    </span>
  )
}
