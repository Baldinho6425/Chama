import { Router } from "express";
import { criarSala, excluirSala, existeSala, listarSalas } from "../salasStore.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const salasRouter = Router();

salasRouter.use(requireAuth);

salasRouter.get("/", async (req, res) => {
  res.json(await listarSalas());
});

salasRouter.post("/", async (req, res) => {
  const { bloco, sala } = req.body;

  if (!bloco?.trim() || !sala?.trim()) {
    return res.status(400).json({ erro: "bloco e sala são obrigatórios" });
  }

  if (await existeSala(bloco.trim(), sala.trim())) {
    return res.status(409).json({ erro: "essa sala já está cadastrada" });
  }

  const nova = await criarSala({ bloco: bloco.trim(), sala: sala.trim() });
  res.status(201).json(nova);
});

salasRouter.delete("/:id", async (req, res) => {
  const apagou = await excluirSala(req.params.id);

  if (!apagou) {
    return res.status(404).json({ erro: "sala não encontrada" });
  }

  res.status(204).send();
});
