import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { demandasRouter } from "./routes/demandas.js";
import { pushRouter } from "./routes/push.js";
import { salasRouter } from "./routes/salas.js";
import { usuariosRouter } from "./routes/usuarios.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/demandas", demandasRouter);
app.use("/api/push", pushRouter);
app.use("/api/salas", salasRouter);
app.use("/api/usuarios", usuariosRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Chama API rodando em http://localhost:${PORT}`);
});
