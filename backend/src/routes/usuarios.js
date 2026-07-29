import { Router } from "express";
import { atualizarUsuario, listarTodosUsuarios, listarUsuarios } from "../usersStore.js";
import { requireAuth, requireSupervisor } from "../middleware/requireAuth.js";

const PAPEIS_VALIDOS = ["comum", "supervisor"];

export const usuariosRouter = Router();

usuariosRouter.use(requireAuth);

usuariosRouter.get("/", async (req, res) => {
  const usuarios = await listarUsuarios();
  res.json(usuarios.map(({ id, nome }) => ({ id, nome })));
});

usuariosRouter.get("/gerenciar", requireSupervisor, async (req, res) => {
  res.json(await listarTodosUsuarios());
});

usuariosRouter.patch("/:id", requireSupervisor, async (req, res) => {
  const { papel, ativo } = req.body;

  if (papel !== undefined && !PAPEIS_VALIDOS.includes(papel)) {
    return res.status(400).json({ erro: `papel inválido, use: ${PAPEIS_VALIDOS.join(", ")}` });
  }

  if (ativo !== undefined && typeof ativo !== "boolean") {
    return res.status(400).json({ erro: "ativo deve ser true ou false" });
  }

  if (Number(req.params.id) === req.usuario.id && (ativo === false || papel === "comum")) {
    return res.status(400).json({ erro: "você não pode inativar ou rebaixar sua própria conta" });
  }

  const atualizado = await atualizarUsuario(req.params.id, { papel, ativo });

  if (!atualizado) {
    return res.status(404).json({ erro: "usuário não encontrado" });
  }

  res.json(atualizado);
});
