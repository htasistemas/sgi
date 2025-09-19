# SGI Plataforma

Esta versão do SGI foi reestruturada para utilizar uma API em Node.js com Express, um front-end em Angular e banco de dados PostgreSQL.

## Estrutura

- `backend/` – API Express responsável pelos cadastros (equipes, sistemas, clientes e status).
- `frontend/` – Aplicação Angular que consome a API.
- `backend/db/schema.sql` – Script SQL para criação das tabelas no PostgreSQL.

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 13 ou superior

## Configuração do banco

1. Crie um banco de dados no PostgreSQL.
2. Execute o script `backend/db/schema.sql` para criar as tabelas necessárias.
3. Copie `backend/.env.example` para `backend/.env` e ajuste a variável `DATABASE_URL` com as credenciais do banco.

## Executando a API

```bash
cd backend
npm install
npm run dev
```

A API será iniciada em `http://localhost:3000` por padrão.

## Executando o front-end

```bash
cd frontend
npm install
npm start
```

A aplicação Angular ficará disponível em `http://localhost:4200` e utilizará os endpoints da API.

## Importação de dados

Nos submenus de **Cadastros Gerais** existem botões de importação que aceitam arquivos `.xlsx`. O arquivo deve conter uma planilha com cabeçalhos compatíveis (`Nome`, `Email`, `Telefone`, `Função`, etc.). Os registros válidos serão enviados automaticamente para a API.
