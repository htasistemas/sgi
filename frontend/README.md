# SGI Frontend

Aplicação Angular responsável pela interface de Cadastros Gerais do SGI.

## Scripts disponíveis

- `npm start` – executa o servidor de desenvolvimento em `http://localhost:4200`.
- `npm run build` – gera a build de produção no diretório `dist/`.
- `npm test` – executa os testes unitários (requer Chrome disponível no ambiente).

## Estrutura principal

- `src/app/core` – modelos e serviços compartilhados.
- `src/app/features/cadastros` – componentes e estilos da área de cadastros.

A aplicação consome a API exposta pelo diretório `../backend`. Ajuste a URL base através da variável `NG_APP_API_URL` (por padrão `/api`).
