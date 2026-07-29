import { pool } from "./db.js";

export async function listarPorDemanda(demandaId) {
  const { rows } = await pool.query(
    "SELECT * FROM historico WHERE demanda_id = $1 ORDER BY criado_em ASC",
    [Number(demandaId)]
  );
  return rows;
}

export async function adicionarEntrada({ demandaId, usuario, tipo, texto, statusAnterior, statusNovo }) {
  const { rows } = await pool.query(
    `INSERT INTO historico (demanda_id, usuario_id, usuario_nome, tipo, texto, status_anterior, status_novo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      Number(demandaId),
      usuario.id,
      usuario.nome,
      tipo,
      texto ?? null,
      statusAnterior ?? null,
      statusNovo ?? null,
    ]
  );
  return rows[0];
}
