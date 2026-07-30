import { pool } from "./db.js";

function paraPublico(usuario) {
  const { senha_hash, reset_token, reset_token_expira, ...publico } = usuario;
  return publico;
}

export async function listarUsuarios() {
  const { rows } = await pool.query(
    "SELECT * FROM usuarios WHERE ativo = true AND status_cadastro = 'aprovado' ORDER BY id"
  );
  return rows.map(paraPublico);
}

export async function listarTodosUsuarios() {
  const { rows } = await pool.query("SELECT * FROM usuarios ORDER BY id");
  return rows.map(paraPublico);
}

export async function listarPendentes() {
  const { rows } = await pool.query(
    "SELECT * FROM usuarios WHERE status_cadastro = 'pendente' ORDER BY criado_em"
  );
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
    "INSERT INTO usuarios (nome, email, senha_hash, status_cadastro) VALUES ($1, $2, $3, 'pendente') RETURNING *",
    [nome, email.toLowerCase(), senhaHash]
  );
  return paraPublico(rows[0]);
}

export async function atualizarUsuario(id, { papel, ativo, statusCadastro }) {
  const atual = await buscarPorId(id);
  if (!atual) return null;

  const { rows } = await pool.query(
    "UPDATE usuarios SET papel = $1, ativo = $2, status_cadastro = $3 WHERE id = $4 RETURNING *",
    [papel ?? atual.papel, ativo ?? atual.ativo, statusCadastro ?? atual.status_cadastro, Number(id)]
  );
  return paraPublico(rows[0]);
}

export async function salvarTokenReset(email, token, expiraEm) {
  await pool.query(
    "UPDATE usuarios SET reset_token = $1, reset_token_expira = $2 WHERE email = $3",
    [token, expiraEm, email.toLowerCase()]
  );
}

export async function buscarPorTokenReset(token) {
  const { rows } = await pool.query(
    "SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expira > now()",
    [token]
  );
  return rows[0];
}

export async function redefinirSenha(id, senhaHash) {
  await pool.query(
    "UPDATE usuarios SET senha_hash = $1, reset_token = NULL, reset_token_expira = NULL WHERE id = $2",
    [senhaHash, Number(id)]
  );
}

export { paraPublico };
