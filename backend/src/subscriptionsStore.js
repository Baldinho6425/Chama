import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "subscricoes.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

function writeAll(subscricoes) {
  fs.writeFileSync(dataFile, JSON.stringify(subscricoes, null, 2), "utf-8");
}

export function listarSubscricoes() {
  return readAll();
}

export function salvarSubscricao(usuarioId, subscricao) {
  const subscricoes = readAll();
  const semDuplicata = subscricoes.filter((s) => s.endpoint !== subscricao.endpoint);
  semDuplicata.push({ usuarioId, ...subscricao });
  writeAll(semDuplicata);
}

export function removerSubscricao(endpoint) {
  const subscricoes = readAll();
  writeAll(subscricoes.filter((s) => s.endpoint !== endpoint));
}
