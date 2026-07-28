import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "usuarios.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

function writeAll(usuarios) {
  fs.writeFileSync(dataFile, JSON.stringify(usuarios, null, 2), "utf-8");
}

export function listarUsuarios() {
  return readAll().map(paraPublico);
}

export function buscarPorEmail(email) {
  return readAll().find((u) => u.email === email.toLowerCase());
}

export function buscarPorId(id) {
  return readAll().find((u) => u.id === Number(id));
}

export function criarUsuario({ nome, email, senhaHash }) {
  const usuarios = readAll();
  const proximoId = usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;

  const novo = {
    id: proximoId,
    nome,
    email: email.toLowerCase(),
    senhaHash,
    criado_em: new Date().toISOString(),
  };

  usuarios.push(novo);
  writeAll(usuarios);
  return paraPublico(novo);
}

export function paraPublico(usuario) {
  const { senhaHash, ...publico } = usuario;
  return publico;
}
