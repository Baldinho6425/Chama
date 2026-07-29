import { Router } from "express";
import { listarUsuarios } from "../usersStore.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const usuariosRouter = Router();

usuariosRouter.use(requireAuth);

usuariosRouter.get("/", (req, res) => {
  res.json(listarUsuarios().map(({ id, nome }) => ({ id, nome })));
});
