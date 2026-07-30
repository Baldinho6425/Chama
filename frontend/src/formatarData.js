export function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function tempoRelativo(iso) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)

  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `Há ${minutos} min`

  const horas = Math.round(minutos / 60)
  if (horas < 24) return `Há ${horas} h`

  const dias = Math.round(horas / 24)
  if (dias < 30) return `Há ${dias} dia${dias > 1 ? 's' : ''}`

  return formatarData(iso)
}
