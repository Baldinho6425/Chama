import { Router } from "express";
import bcrypt from "bcryptjs";
import { gerarToken } from "../auth.js";
import { buscarPorEmail, buscarPorId, criarUsuario, paraPublico } from "../usersStore.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/registrar", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome?.trim() || !email?.trim() || !senha) {
    return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: "senha deve ter pelo menos 6 caracteres" });
  }

  if (await buscarPorEmail(email)) {
    return res.status(409).json({ erro: "já existe uma conta com esse email" });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await criarUsuario({ nome: nome.trim(), email: email.trim(), senhaHash });
  const token = gerarToken(usuario);

  res.status(201).json({ usuario, token });
});

authRouter.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email?.trim() || !senha) {
    return res.status(400).json({ erro: "email e senha são obrigatórios" });
  }

  const usuario = await buscarPorEmail(email);
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;

  if (!usuario || !senhaConfere) {
    return res.status(401).json({ erro: "email ou senha inválidos" });
  }

  const token = gerarToken(usuario);
  res.json({ usuario: paraPublico(usuario), token });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const usuario = await buscarPorId(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: "usuário não encontrado" });
  }

  res.json(paraPublico(usuario));
});
