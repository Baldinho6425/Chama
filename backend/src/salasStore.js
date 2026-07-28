import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "salas.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

function writeAll(salas) {
  fs.writeFileSync(dataFile, JSON.stringify(salas, null, 2), "utf-8");
}

export function listarSalas() {
  return readAll().sort((a, b) => a.bloco.localeCompare(b.bloco) || a.sala.localeCompare(b.sala));
}

export function existeSala(bloco, sala) {
  return readAll().some(
    (s) => s.bloco.toLowerCase() === bloco.toLowerCase() && s.sala.toLowerCase() === sala.toLowerCase()
  );
}

export function criarSala({ bloco, sala }) {
  const salas = readAll();
  const proximoId = salas.reduce((max, s) => Math.max(max, s.id), 0) + 1;

  const nova = { id: proximoId, bloco, sala, criado_em: new Date().toISOString() };

  salas.push(nova);
  writeAll(salas);
  return nova;
}

export function excluirSala(id) {
  const salas = readAll();
  const restantes = salas.filter((s) => s.id !== Number(id));
  const apagou = restantes.length !== salas.length;
  if (apagou) writeAll(restantes);
  return apagou;
}
