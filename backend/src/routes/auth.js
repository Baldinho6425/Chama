import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { gerarToken } from "../auth.js";
import {
  buscarPorEmail,
  buscarPorId,
  buscarPorTokenReset,
  criarUsuario,
  paraPublico,
  redefinirSenha,
  salvarTokenReset,
} from "../usersStore.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { enviarEmail } from "../email.js";

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

  res.status(201).json({ usuario, pendente: true });
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

  if (usuario.status_cadastro === "pendente") {
    return res
      .status(403)
      .json({ erro: "Seu cadastro está aguardando aprovação de um administrador." });
  }

  if (usuario.status_cadastro === "rejeitado") {
    return res.status(403).json({ erro: "Seu acesso foi negado por um administrador." });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ erro: "esta conta está inativa" });
  }

  const token = gerarToken(usuario);
  res.json({ usuario: paraPublico(usuario), token });
});

authRouter.post("/esqueci-senha", async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ erro: "email é obrigatório" });
  }

  const usuario = await buscarPorEmail(email);

  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000);
    await salvarTokenReset(usuario.email, token, expiraEm);

    const link = `${process.env.FRONTEND_URL}/?redefinir=${token}`;

    try {
      await enviarEmail({
        to: usuario.email,
        subject: "Redefinir senha - Chama",
        html: `
          <p>Você pediu para redefinir sua senha no Chama.</p>
          <p><a href="${link}">Clique aqui para escolher uma nova senha</a></p>
          <p>Esse link expira em 1 hora. Se não foi você, pode ignorar este email.</p>
        `,
      });
    } catch (err) {
      console.error("Erro ao enviar email de redefinição:", err.message);
    }
  }

  res.json({ ok: true, mensagem: "Se esse email existir, enviamos um link de redefinição." });
});

authRouter.post("/redefinir-senha", async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res.status(400).json({ erro: "token e novaSenha são obrigatórios" });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: "senha deve ter pelo menos 6 caracteres" });
  }

  const usuario = await buscarPorTokenReset(token);

  if (!usuario) {
    return res.status(400).json({ erro: "link inválido ou expirado" });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  await redefinirSenha(usuario.id, senhaHash);

  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const usuario = await buscarPorId(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: "usuário não encontrado" });
  }

  res.json(paraPublico(usuario));
});
