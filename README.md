# Eventos

Aplicacao full stack para cadastro e gerenciamento de eventos, com autenticacao, dashboard com calendario e CRUD de usuarios e eventos.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Banco: PostgreSQL + Prisma ORM
- Autenticacao: JWT

## Funcionalidades

- Login com email e senha
- Dashboard com calendario de eventos
- CRUD de eventos
- CRUD de usuarios

## Estrutura

```text
apps/
  api/
  web/
docker-compose.yml
package.json
```

## Como rodar

### 1. Instale Node.js

Use Node.js 20 ou superior, com npm disponivel no PATH.

### 2. Instale as dependencias

```bash
npm install
npm install --workspace @eventos/api
npm install --workspace @eventos/web
```

### 3. Suba o banco

```bash
docker compose up -d postgres
```

### 4. Configure variaveis de ambiente

Copie os exemplos abaixo:

- apps/api/.env.example para apps/api/.env
- apps/web/.env.example para apps/web/.env

### 5. Gere o client Prisma e rode migrations

```bash
npm run prisma:generate --workspace @eventos/api
npm run prisma:migrate --workspace @eventos/api
npm run prisma:seed --workspace @eventos/api
```

### 6. Rode a aplicacao

```bash
npm run dev
```

## Usuario inicial

- Email: admin@eventos.local
- Senha: admin123

## Observacao

O ambiente atual do workspace nao possui Node.js ou npm disponiveis no terminal, então a estrutura e o codigo foram preparados, mas a instalacao e a validacao de build dependem dessa instalacao local.
