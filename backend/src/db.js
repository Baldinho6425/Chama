import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definido (configure backend/.env)");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL DEFAULT 'comum',
      ativo BOOLEAN NOT NULL DEFAULT true,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS papel TEXT NOT NULL DEFAULT 'comum';
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token TEXT;
    ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expira TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS salas (
      id SERIAL PRIMARY KEY,
      bloco TEXT NOT NULL,
      sala TEXT NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (bloco, sala)
    );

    CREATE TABLE IF NOT EXISTS demandas (
      id SERIAL PRIMARY KEY,
      bloco TEXT NOT NULL,
      sala TEXT NOT NULL,
      observacoes TEXT NOT NULL,
      prioridade TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pendente',
      criado_por_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      criado_por_nome TEXT,
      responsavel_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      responsavel_nome TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS historico (
      id SERIAL PRIMARY KEY,
      demanda_id INTEGER NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      usuario_nome TEXT,
      tipo TEXT NOT NULL,
      texto TEXT,
      status_anterior TEXT,
      status_novo TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS subscricoes (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
