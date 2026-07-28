import { Router } from "express";
import { createDemanda, deleteDemanda, getDemanda, listDemandas, updateDemanda } from "../store.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { notificarNovaDemanda } from "../push.js";

const STATUS_VALIDOS = ["pendente", "em_andamento", "concluida"];
const PRIORIDADES_VALIDAS = ["baixa", "normal", "urgente"];

export const demandasRouter = Router();

demandasRouter.use(requireAuth);

demandasRouter.get("/", (req, res) => {
  const { status } = req.query;
  res.json(listDemandas(status));
});

demandasRouter.post("/", async (req, res) => {
  const { bloco, sala, observacoes, prioridade } = req.body;

  if (!bloco?.trim() || !sala?.trim() || !observacoes?.trim()) {
    return res.status(400).json({ erro: "bloco, sala e observacoes são obrigatórios" });
  }

  if (prioridade !== undefined && !PRIORIDADES_VALIDAS.includes(prioridade)) {
    return res.status(400).json({ erro: `prioridade inválida, use: ${PRIORIDADES_VALIDAS.join(", ")}` });
  }

  const demanda = createDemanda({
    bloco: bloco.trim(),
    sala: sala.trim(),
    observacoes: observacoes.trim(),
    prioridade,
    criadoPor: req.usuario,
  });

  res.status(201).json(demanda);
  notificarNovaDemanda(demanda).catch((err) => console.error("Erro ao notificar:", err));
});

demandasRouter.patch("/:id", (req, res) => {
  const { id } = req.params;

  if (!getDemanda(id)) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  const { bloco, sala, observacoes, status, prioridade } = req.body;

  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `status inválido, use: ${STATUS_VALIDOS.join(", ")}` });
  }

  if (prioridade !== undefined && !PRIORIDADES_VALIDAS.includes(prioridade)) {
    return res.status(400).json({ erro: `prioridade inválida, use: ${PRIORIDADES_VALIDAS.join(", ")}` });
  }

  const atualizada = updateDemanda(id, {
    bloco: bloco?.trim(),
    sala: sala?.trim(),
    observacoes: observacoes?.trim(),
    status,
    prioridade,
  });

  res.json(atualizada);
});

demandasRouter.delete("/:id", (req, res) => {
  const apagou = deleteDemanda(req.params.id);

  if (!apagou) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  res.status(204).send();
});
