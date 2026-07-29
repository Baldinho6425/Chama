import { pool } from "./db.js";

function paraPublico(usuario) {
  const { senha_hash, ...publico } = usuario;
  return publico;
}

export async function listarUsuarios() {
  const { rows } = await pool.query("SELECT * FROM usuarios ORDER BY id");
  return rows.map(paraPublico);
}

export async function buscarPorEmail(email) {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return rows[0];
}

export async function buscarPorId(id) {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [Number(id)]);
  return rows[0];
}

export async function criarUsuario({ nome, email, senhaHash }) {
  const { rows } = await pool.query(
    "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING *",
    [nome, email.toLowerCase(), senhaHash]
  );
  return paraPublico(rows[0]);
}

export { paraPublico };
