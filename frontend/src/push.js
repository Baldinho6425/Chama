import { buscarChavePublicaPush, inscreverPush } from './api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function suportado() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export async function statusNotificacoes() {
  if (!suportado()) return 'unsupported'
  if (Notification.permission === 'denied') return 'negado'

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return 'inativo'

  const subscription = await registration.pushManager.getSubscription()
  return subscription ? 'ativo' : 'inativo'
}

export async function ativarNotificacoes() {
  if (!suportado()) {
    throw new Error('Notificações push não são suportadas neste navegador.')
  }

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') {
    throw new Error('Permissão de notificação negada.')
  }

  const registration = await navigator.serviceWorker.ready
  const { chave } = await buscarChavePublicaPush()

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(chave),
    })
  }

  await inscreverPush(subscription.toJSON())
}
