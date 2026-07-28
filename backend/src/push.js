import webpush from "web-push";
import { listarSubscricoes, removerSubscricao } from "./subscriptionsStore.js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function notificarNovaDemanda(demanda) {
  const payload = JSON.stringify({
    titulo: "Nova demanda cadastrada",
    corpo: `Bloco ${demanda.bloco} · Sala ${demanda.sala} — ${demanda.observacoes}`,
    url: "/",
  });

  const destinatarios = listarSubscricoes().filter((s) => s.usuarioId !== demanda.criado_por_id);

  await Promise.all(
    destinatarios.map(async (subscricao) => {
      try {
        await webpush.sendNotification(subscricao, payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          removerSubscricao(subscricao.endpoint);
        } else {
          console.error("Falha ao enviar push:", err.message);
        }
      }
    })
  );
}
