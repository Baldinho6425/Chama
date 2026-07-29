import { pool } from "./db.js";

export async function listDemandas(status) {
  const { rows } = status
    ? await pool.query("SELECT * FROM demandas WHERE status = $1 ORDER BY criado_em DESC", [
        status,
      ])
    : await pool.query("SELECT * FROM demandas ORDER BY criado_em DESC");
  return rows;
}

export async function getDemanda(id) {
  const { rows } = await pool.query("SELECT * FROM demandas WHERE id = $1", [Number(id)]);
  return rows[0];
}

export async function createDemanda({ bloco, sala, observacoes, prioridade, criadoPor }) {
  const { rows } = await pool.query(
    `INSERT INTO demandas (bloco, sala, observacoes, prioridade, criado_por_id, criado_por_nome)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [bloco, sala, observacoes, prioridade ?? "normal", criadoPor.id, criadoPor.nome]
  );
  return rows[0];
}

export async function updateDemanda(id, campos) {
  const atual = await getDemanda(id);
  if (!atual) return null;

  const responsavelTocado = "responsavelId" in campos;

  const { rows } = await pool.query(
    `UPDATE demandas
     SET bloco = $1,
         sala = $2,
         observacoes = $3,
         prioridade = $4,
         status = $5,
         responsavel_id = $6,
         responsavel_nome = $7,
         atualizado_em = now()
     WHERE id = $8
     RETURNING *`,
    [
      campos.bloco ?? atual.bloco,
      campos.sala ?? atual.sala,
      campos.observacoes ?? atual.observacoes,
      campos.prioridade ?? atual.prioridade,
      campos.status ?? atual.status,
      responsavelTocado ? campos.responsavelId : atual.responsavel_id,
      responsavelTocado ? campos.responsavelNome : atual.responsavel_nome,
      Number(id),
    ]
  );
  return rows[0];
}

export async function deleteDemanda(id) {
  const { rowCount } = await pool.query("DELETE FROM demandas WHERE id = $1", [Number(id)]);
  return rowCount > 0;
}
