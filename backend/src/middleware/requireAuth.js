import { verificarToken } from "../auth.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? "";
  const [tipo, token] = authHeader.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "token ausente" });
  }

  try {
    req.usuario = verificarToken(token);
    next();
  } catch {
    res.status(401).json({ erro: "token inválido ou expirado" });
  }
}
