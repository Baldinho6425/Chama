import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRA_EM = "30d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definido (configure backend/.env)");
}

export function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, nome: usuario.nome, email: usuario.email }, JWT_SECRET, {
    expiresIn: EXPIRA_EM,
  });
}

export function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
