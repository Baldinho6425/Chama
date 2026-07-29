import "dotenv/config";
import express from "express";
import cors from "cors";
import { initSchema } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { demandasRouter } from "./routes/demandas.js";
import { pushRouter } from "./routes/push.js";
import { salasRouter } from "./routes/salas.js";
import { usuariosRouter } from "./routes/usuarios.js";

const app = express();
const PORT = process.env.PORT || 3001;

const origensPermitidas = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origensPermitidas.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origem não permitida pelo CORS"));
      }
    },
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/demandas", demandasRouter);
app.use("/api/push", pushRouter);
app.use("/api/salas", salasRouter);
app.use("/api/usuarios", usuariosRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err.message);
  res.status(err.status ?? 500).json({ erro: err.message ?? "erro interno" });
});

await initSchema();

app.listen(PORT, () => {
  console.log(`Chama API rodando em http://localhost:${PORT}`);
});
