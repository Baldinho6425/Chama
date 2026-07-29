import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "historico.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

function writeAll(entradas) {
  fs.writeFileSync(dataFile, JSON.stringify(entradas, null, 2), "utf-8");
}

export function listarPorDemanda(demandaId) {
  return readAll()
    .filter((e) => e.demanda_id === Number(demandaId))
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em));
}

export function adicionarEntrada({ demandaId, usuario, tipo, texto, statusAnterior, statusNovo }) {
  const entradas = readAll();
  const proximoId = entradas.reduce((max, e) => Math.max(max, e.id), 0) + 1;

  const nova = {
    id: proximoId,
    demanda_id: Number(demandaId),
    usuario_id: usuario.id,
    usuario_nome: usuario.nome,
    tipo,
    texto: texto ?? null,
    status_anterior: statusAnterior ?? null,
    status_novo: statusNovo ?? null,
    criado_em: new Date().toISOString(),
  };

  entradas.push(nova);
  writeAll(entradas);
  return nova;
}
