import { Router } from "express";
import { listarUsuarios } from "../usersStore.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const usuariosRouter = Router();

usuariosRouter.use(requireAuth);

usuariosRouter.get("/", async (req, res) => {
  const usuarios = await listarUsuarios();
  res.json(usuarios.map(({ id, nome }) => ({ id, nome })));
});
