import { verificarToken } from "../auth.js";
import { buscarPorId } from "../usersStore.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? "";
  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "token ausente" });
  }

  let payload;
  try {
    payload = verificarToken(token);
  } catch {
    return res.status(401).json({ erro: "token inválido ou expirado" });
  }

  const usuario = await buscarPorId(payload.id);

  if (!usuario) {
    return res.status(401).json({ erro: "usuário não encontrado" });
  }

  if (usuario.status_cadastro !== "aprovado") {
    return res.status(403).json({ erro: "acesso ainda não aprovado" });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ erro: "usuário inativo" });
  }

  req.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel };
  next();
}

export function requireSupervisor(req, res, next) {
  if (req.usuario?.papel !== "supervisor") {
    return res.status(403).json({ erro: "acesso restrito a supervisores" });
  }
  next();
}
