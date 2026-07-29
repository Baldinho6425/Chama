import { pool } from "./db.js";

export async function listarSalas() {
  const { rows } = await pool.query("SELECT * FROM salas ORDER BY bloco, sala");
  return rows;
}

export async function existeSala(bloco, sala) {
  const { rows } = await pool.query(
    "SELECT 1 FROM salas WHERE lower(bloco) = lower($1) AND lower(sala) = lower($2)",
    [bloco, sala]
  );
  return rows.length > 0;
}

export async function criarSala({ bloco, sala }) {
  const { rows } = await pool.query(
    "INSERT INTO salas (bloco, sala) VALUES ($1, $2) RETURNING *",
    [bloco, sala]
  );
  return rows[0];
}

export async function excluirSala(id) {
  const { rowCount } = await pool.query("DELETE FROM salas WHERE id = $1", [Number(id)]);
  return rowCount > 0;
}
