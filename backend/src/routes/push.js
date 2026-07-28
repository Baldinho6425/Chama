import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { removerSubscricao, salvarSubscricao } from "../subscriptionsStore.js";

export const pushRouter = Router();

pushRouter.get("/vapid-public-key", (req, res) => {
  res.json({ chave: process.env.VAPID_PUBLIC_KEY });
});

pushRouter.post("/subscribe", requireAuth, (req, res) => {
  const subscricao = req.body;

  if (!subscricao?.endpoint || !subscricao?.keys) {
    return res.status(400).json({ erro: "subscrição inválida" });
  }

  salvarSubscricao(req.usuario.id, subscricao);
  res.status(201).json({ ok: true });
});

pushRouter.delete("/subscribe", requireAuth, (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ erro: "endpoint é obrigatório" });
  }

  removerSubscricao(endpoint);
  res.status(204).send();
});
