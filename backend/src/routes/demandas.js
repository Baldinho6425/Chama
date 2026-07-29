import { Router } from "express";
import { createDemanda, deleteDemanda, getDemanda, listDemandas, updateDemanda } from "../store.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { notificarNovaDemanda } from "../push.js";
import { adicionarEntrada, listarPorDemanda } from "../historicoStore.js";
import { buscarPorId } from "../usersStore.js";

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

  adicionarEntrada({ demandaId: demanda.id, usuario: req.usuario, tipo: "criacao" });

  res.status(201).json(demanda);
  notificarNovaDemanda(demanda).catch((err) => console.error("Erro ao notificar:", err));
});

demandasRouter.patch("/:id", (req, res) => {
  const { id } = req.params;
  const existente = getDemanda(id);

  if (!existente) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  const { bloco, sala, observacoes, status, prioridade, responsavelId } = req.body;

  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `status inválido, use: ${STATUS_VALIDOS.join(", ")}` });
  }

  if (prioridade !== undefined && !PRIORIDADES_VALIDAS.includes(prioridade)) {
    return res.status(400).json({ erro: `prioridade inválida, use: ${PRIORIDADES_VALIDAS.join(", ")}` });
  }

  const campos = {
    bloco: bloco?.trim(),
    sala: sala?.trim(),
    observacoes: observacoes?.trim(),
    status,
    prioridade,
  };

  let responsavelNovo;
  if (responsavelId !== undefined) {
    if (responsavelId === null) {
      campos.responsavelId = null;
      campos.responsavelNome = null;
    } else {
      const usuario = buscarPorId(responsavelId);
      if (!usuario) {
        return res.status(400).json({ erro: "usuário responsável não encontrado" });
      }
      campos.responsavelId = usuario.id;
      campos.responsavelNome = usuario.nome;
    }
    responsavelNovo = campos.responsavelNome;
  }

  const atualizada = updateDemanda(id, campos);

  if (status !== undefined && status !== existente.status) {
    adicionarEntrada({
      demandaId: id,
      usuario: req.usuario,
      tipo: "status",
      statusAnterior: existente.status,
      statusNovo: status,
    });
  }

  if (responsavelId !== undefined && responsavelId !== existente.responsavel_id) {
    adicionarEntrada({
      demandaId: id,
      usuario: req.usuario,
      tipo: "responsavel",
      texto: responsavelNovo ? `Atribuída a ${responsavelNovo}` : "Atribuição removida",
    });
  }

  res.json(atualizada);
});

demandasRouter.delete("/:id", (req, res) => {
  const apagou = deleteDemanda(req.params.id);

  if (!apagou) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  res.status(204).send();
});

demandasRouter.get("/:id/historico", (req, res) => {
  if (!getDemanda(req.params.id)) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  res.json(listarPorDemanda(req.params.id));
});

demandasRouter.post("/:id/historico", (req, res) => {
  if (!getDemanda(req.params.id)) {
    return res.status(404).json({ erro: "demanda não encontrada" });
  }

  const { texto } = req.body;

  if (!texto?.trim()) {
    return res.status(400).json({ erro: "texto é obrigatório" });
  }

  const entrada = adicionarEntrada({
    demandaId: req.params.id,
    usuario: req.usuario,
    tipo: "comentario",
    texto: texto.trim(),
  });

  res.status(201).json(entrada);
});
