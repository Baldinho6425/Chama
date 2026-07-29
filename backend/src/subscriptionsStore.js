import { pool } from "./db.js";

function paraSubscricaoWebPush(row) {
  return {
    usuarioId: row.usuario_id,
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };
}

export async function listarSubscricoes() {
  const { rows } = await pool.query("SELECT * FROM subscricoes");
  return rows.map(paraSubscricaoWebPush);
}

export async function salvarSubscricao(usuarioId, subscricao) {
  await pool.query(
    `INSERT INTO subscricoes (usuario_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE SET usuario_id = $1, p256dh = $3, auth = $4`,
    [usuarioId, subscricao.endpoint, subscricao.keys.p256dh, subscricao.keys.auth]
  );
}

export async function removerSubscricao(endpoint) {
  await pool.query("DELETE FROM subscricoes WHERE endpoint = $1", [endpoint]);
}
