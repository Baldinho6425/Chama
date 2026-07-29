import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "demandas.json");

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]", "utf-8");
}

function readAll() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}

function writeAll(demandas) {
  fs.writeFileSync(dataFile, JSON.stringify(demandas, null, 2), "utf-8");
}

function timestamp() {
  return new Date().toISOString();
}

export function listDemandas(status) {
  const demandas = readAll().sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  return status ? demandas.filter((d) => d.status === status) : demandas;
}

export function getDemanda(id) {
  return readAll().find((d) => d.id === Number(id));
}

export function createDemanda({ bloco, sala, observacoes, prioridade, criadoPor }) {
  const demandas = readAll();
  const proximoId = demandas.reduce((max, d) => Math.max(max, d.id), 0) + 1;
  const agora = timestamp();

  const nova = {
    id: proximoId,
    bloco,
    sala,
    observacoes,
    prioridade: prioridade ?? "normal",
    status: "pendente",
    criado_por_id: criadoPor.id,
    criado_por_nome: criadoPor.nome,
    responsavel_id: null,
    responsavel_nome: null,
    criado_em: agora,
    atualizado_em: agora,
  };

  demandas.push(nova);
  writeAll(demandas);
  return nova;
}

export function updateDemanda(id, campos) {
  const demandas = readAll();
  const index = demandas.findIndex((d) => d.id === Number(id));
  if (index === -1) return null;

  const atual = demandas[index];
  const atualizada = {
    ...atual,
    bloco: campos.bloco ?? atual.bloco,
    sala: campos.sala ?? atual.sala,
    observacoes: campos.observacoes ?? atual.observacoes,
    prioridade: campos.prioridade ?? atual.prioridade,
    status: campos.status ?? atual.status,
    responsavel_id: "responsavelId" in campos ? campos.responsavelId : atual.responsavel_id,
    responsavel_nome: "responsavelId" in campos ? campos.responsavelNome : atual.responsavel_nome,
    atualizado_em: timestamp(),
  };

  demandas[index] = atualizada;
  writeAll(demandas);
  return atualizada;
}

export function deleteDemanda(id) {
  const demandas = readAll();
  const restantes = demandas.filter((d) => d.id !== Number(id));
  const apagou = restantes.length !== demandas.length;
  if (apagou) writeAll(restantes);
  return apagou;
}
