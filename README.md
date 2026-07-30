# Chama

App para cadastro e acompanhamento de demandas de TI, organizadas por sala (Bloco + Sala) com um campo de observações descrevendo o que precisa ser feito. Tem login individual (com aprovação de cadastro por um supervisor), prioridade, edição de demandas, histórico/comentários por demanda e notificação push quando uma nova demanda é cadastrada.

Funciona pelo navegador (celular ou desktop) e pode ser instalado como app (PWA). Layout com navegação por abas + sidebar no desktop, e barra de navegação inferior no mobile.

**App no ar:** https://frontend-teal-beta-23.vercel.app

## Estrutura

- `backend/` — API em Node.js/Express. Dados guardados em PostgreSQL (ver `backend/src/db.js` para o schema).
- `frontend/` — App em React + Vite, com PWA instalável e service worker próprio (para receber notificações push).

## Como rodar

### Backend

Precisa de um banco PostgreSQL — recomendado [Neon](https://neon.tech) (gratuito, sem expiração). Crie um projeto lá e copie a connection string.

```bash
cd backend
npm install
copy .env.example .env   # ajuste DATABASE_URL, JWT_SECRET e as chaves VAPID (veja abaixo)
npm run dev
```

Sobe em `http://localhost:3001` e cria as tabelas automaticamente no banco (se ainda não existirem) ao iniciar.

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

## Login e papéis

Cada pessoa cria sua própria conta (nome, email, senha) na primeira vez que acessa — a demanda guarda quem a criou.

**Sala de espera:** toda conta nova nasce com `status_cadastro = pendente` e não consegue logar até um supervisor aprovar. Se tentar entrar antes da aprovação, recebe uma mensagem explicando que o cadastro está aguardando análise. Se o supervisor recusar, a mensagem avisa que o acesso foi negado (a conta continua visível pro supervisor, que pode reverter e aprovar depois se mudar de ideia).

Toda conta nasce com papel `comum`. Um **supervisor** (promovido diretamente no banco a primeira vez, depois pela própria aba "Usuários") tem acesso extra a:
- Uma seção "Solicitações pendentes" no topo da aba "Usuários", com botões Aprovar/Recusar — a aba mostra um contador em vermelho com a quantidade de pedidos esperando.
- Promover/rebaixar outras contas e ativar/inativar (usuário inativo não consegue logar — inclusive sessões já abertas são cortadas na próxima requisição — e some da lista de "atribuir responsável").
- Um supervisor não consegue se auto-inativar nem se auto-rebaixar, pra evitar ficar sem acesso por engano.

O Painel de estatísticas continua visível para todos os usuários, não só supervisores.

**Esqueci minha senha:** a tela de login tem um link para recuperação — envia um email (via [Resend](https://resend.com)) com um link de redefinição válido por 1 hora, uso único. Requer a variável `RESEND_API_KEY` configurada no backend.

## API

Todas as rotas exigem o header `Authorization: Bearer <token>` (obtido no login), exceto `/api/auth/registrar`, `/api/auth/login`, `/api/auth/esqueci-senha`, `/api/auth/redefinir-senha` e `/api/push/vapid-public-key`.

- `POST /api/auth/registrar` — cria conta (`nome`, `email`, `senha`) com cadastro pendente, retorna `{ usuario, pendente: true }` (sem token — só loga depois de aprovado)
- `POST /api/auth/login` — autentica (`email`, `senha`), retorna `{ usuario, token }`; bloqueia com 403 se o cadastro estiver pendente, recusado ou inativo
- `POST /api/auth/esqueci-senha` — envia email de redefinição se o email existir (resposta genérica, não revela se a conta existe)
- `POST /api/auth/redefinir-senha` — troca a senha usando o token recebido por email (`token`, `novaSenha`)
- `GET /api/auth/me` — dados do usuário autenticado
- `GET /api/usuarios` — lista usuários ativos e aprovados (`id`, `nome`), usado pra atribuir responsável
- `GET /api/usuarios/gerenciar` — **supervisor**: lista completa de usuários (`papel`, `ativo`, `status_cadastro`, `email`, etc.)
- `GET /api/usuarios/pendentes` — **supervisor**: lista só os cadastros aguardando aprovação
- `PATCH /api/usuarios/:id` — **supervisor**: atualiza `papel`, `ativo` e/ou `statusCadastro` (`aprovado`/`rejeitado`) de um usuário
- `GET /api/demandas` — lista demandas (aceita `?status=pendente|em_andamento|concluida`), cada item inclui `total_comentarios`
- `POST /api/demandas` — cria demanda (`bloco`, `sala`, `observacoes`, `prioridade` opcional: baixa/normal/urgente)
- `PATCH /api/demandas/:id` — edita campos, status, prioridade e/ou `responsavelId` (número ou `null` pra remover)
- `DELETE /api/demandas/:id` — remove demanda
- `GET /api/demandas/:id/historico` — linha do tempo da demanda (criação, mudanças de status/responsável, comentários)
- `POST /api/demandas/:id/historico` — adiciona um comentário (`texto`)
- `GET /api/salas` — lista blocos/salas cadastrados
- `POST /api/salas` — cadastra uma sala (`bloco`, `sala`)
- `DELETE /api/salas/:id` — remove uma sala
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
3. Preencha as variáveis de ambiente pedidas: `DATABASE_URL` (connection string do Neon/Postgres), `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (gere as chaves como descrito acima), `RESEND_API_KEY` (para o email de redefinição de senha). `JWT_SECRET` é gerado automaticamente. `CORS_ORIGIN` e `FRONTEND_URL` já vêm preenchidos no `render.yaml` apontando pro frontend na Vercel.
4. Depois do deploy, anote a URL pública (algo como `https://chama-backend.onrender.com`).

> **Atenção:** variáveis marcadas `sync: false` no `render.yaml` (como `DATABASE_URL` e `RESEND_API_KEY`) não bloqueiam nem avisam se ficarem vazias — o deploy novo simplesmente falha ao iniciar e o Render continua servindo a versão anterior, o que pode parecer que "está tudo bem" por um tempo. Depois de adicionar uma variável nova ao Blueprint, sempre confira no painel do Render se ela foi preenchida.

> **Atenção:** no plano free do Render, o serviço "dorme" após 15 min sem uso (a próxima requisição demora ~30-50s pra acordar). Isso não afeta mais os dados — com o Postgres, eles ficam salvos independente do Render dormir ou reiniciar.

### Frontend na Vercel

1. `cd frontend && npx vercel login` (abre o navegador pra autenticar).
2. `npx vercel` — na primeira vez, aponte o "Root Directory" para `frontend` se perguntado, e configure a variável de ambiente `VITE_API_URL` apontando para a URL do backend no Render (ex: `https://chama-backend.onrender.com/api`).
3. `npx vercel --prod` para publicar em produção. A Vercel te dá a URL pública (ex: `https://chama.vercel.app`) — é esse link que dá pra acessar de qualquer PC/celular.

## Próximos passos sugeridos

- Anexar foto na demanda
- Exportar demandas em CSV
- Campo de "Título" separado das observações
