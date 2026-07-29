# Chama

App para cadastro e acompanhamento de demandas de TI, organizadas por sala (Bloco + Sala) com um campo de observações descrevendo o que precisa ser feito. Tem login individual, prioridade, edição de demandas e notificação push quando uma nova demanda é cadastrada.

Funciona pelo navegador (celular ou desktop) e pode ser instalado como app (PWA).

**App no ar:** https://frontend-teal-beta-23.vercel.app

## Estrutura

- `backend/` — API em Node.js/Express. Dados guardados em arquivos JSON em `backend/data/` (demandas, usuários, inscrições de push).
- `frontend/` — App em React + Vite, com PWA instalável e service worker próprio (para receber notificações push).

## Como rodar

### Backend

```bash
cd backend
npm install
copy .env.example .env   # ajuste JWT_SECRET e as chaves VAPID (veja abaixo)
npm run dev
```

Sobe em `http://localhost:3001`.

**Gerar as chaves VAPID** (necessárias para notificações push), uma vez só:

```bash
node -e "const wp = require('web-push'); const k = wp.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY='+k.publicKey); console.log('VAPID_PRIVATE_KEY='+k.privateKey)"
```

Copie os valores gerados para `backend/.env`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`. Por padrão aponta para a API em `http://localhost:3001/api` (configurável em `frontend/.env`, veja `.env.example`).

Para instalar como app no celular: acesse a URL do frontend pelo navegador (Chrome/Edge) e use "Adicionar à tela inicial" / "Instalar app". Ao entrar, use "Ativar notificações" para receber avisos de novas demandas mesmo com o app fechado.

> **Importante:** navegadores só permitem notificação push em contexto seguro (`https://` ou `localhost`). Para testar em outro aparelho na mesma rede (ex: celular acessando o IP do PC), o site precisa estar atrás de HTTPS — funciona só em `localhost` no próprio PC até fazer o deploy.

## Login

Cada pessoa cria sua própria conta (nome, email, senha) na primeira vez que acessa. Não existe usuário "admin" separado — a demanda guarda quem a criou.

## API

Todas as rotas de `/api/demandas` e `/api/push` exigem o header `Authorization: Bearer <token>` (obtido no login).

- `POST /api/auth/registrar` — cria conta (`nome`, `email`, `senha`), retorna `{ usuario, token }`
- `POST /api/auth/login` — autentica (`email`, `senha`), retorna `{ usuario, token }`
- `GET /api/auth/me` — dados do usuário autenticado
- `GET /api/demandas` — lista demandas (aceita `?status=pendente|em_andamento|concluida`)
- `POST /api/demandas` — cria demanda (`bloco`, `sala`, `observacoes`, `prioridade` opcional: baixa/normal/urgente)
- `PATCH /api/demandas/:id` — edita campos e/ou status/prioridade
- `DELETE /api/demandas/:id` — remove demanda
- `GET /api/push/vapid-public-key` — chave pública para inscrição de push
- `POST /api/push/subscribe` — registra inscrição de push do usuário logado
- `DELETE /api/push/subscribe` — remove inscrição

## Deploy (Vercel + Render)

Setup pensado pra testar rápido fora do localhost — frontend na Vercel, backend no Render.

Deploy atual:
- Frontend: https://frontend-teal-beta-23.vercel.app
- Backend: https://chama-backend-a408.onrender.com

### Backend no Render

1. Crie uma conta em [render.com](https://render.com) e conecte seu GitHub.
2. "New" → "Blueprint" → selecione o repositório `Chama`. O Render lê o `render.yaml` da raiz e configura o serviço `chama-backend` automaticamente (`rootDir: backend`).
3. Preencha as variáveis de ambiente pedidas: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (gere as chaves como descrito acima). `JWT_SECRET` é gerado automaticamente.
4. Depois do deploy, anote a URL pública (algo como `https://chama-backend.onrender.com`).

> **Atenção:** no plano free do Render, o serviço "dorme" após 15 min sem uso e o disco não é persistente entre reinícios — os dados (`backend/data/*.json`) podem ser perdidos quando isso acontece. Ok pra testar, mas não guarde nada importante até migrar para um banco de dados de verdade.

### Frontend na Vercel

1. `cd frontend && npx vercel login` (abre o navegador pra autenticar).
2. `npx vercel` — na primeira vez, aponte o "Root Directory" para `frontend` se perguntado, e configure a variável de ambiente `VITE_API_URL` apontando para a URL do backend no Render (ex: `https://chama-backend.onrender.com/api`).
3. `npx vercel --prod` para publicar em produção. A Vercel te dá a URL pública (ex: `https://chama.vercel.app`) — é esse link que dá pra acessar de qualquer PC/celular.

## Próximos passos sugeridos

- Migrar o armazenamento de arquivos JSON para um banco de dados real (evita perda de dados no Render free e permite rodar 100% na Vercel com funções serverless)
- Papéis de usuário (ex: só quem solicitou vs. quem atende)
- Anexar foto na demanda
