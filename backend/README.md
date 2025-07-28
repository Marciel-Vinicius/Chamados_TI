# Backend do Sistema de Chamados TI

## Descrição
Backend Node.js + Express com SQLite e JWT para autenticação, para um sistema de tickets de TI.

## Instalação

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   DATABASE_URL=sqlite://./database.sqlite
   JWT_SECRET=seu_jwt_secreto
   ```
4. (Opcional) Instale o nodemon globalmente:
   ```bash
   npm install -g nodemon
   ```

## Uso

- **Iniciar em modo desenvolvimento**:
  ```bash
  npm run dev
  ```
- **Iniciar em produção**:
  ```bash
  npm start
  ```

O servidor iniciará na porta `3000` por padrão.

## Endpoints

### Autenticação
- `POST /auth/register`  
  Registra usuário comum.  
  Body: `{ "email": "seu@email.com", "password": "sua_senha" }`

- `POST /auth/login`  
  Faz login e retorna token JWT.  
  Body: `{ "email": "seu@email.com", "password": "sua_senha" }`

### Chamados (protegido)
- `POST /tickets`  
  Cria chamado.  
  FormData: `title`, `description`, `category`, `priority`, `attachment` (arquivo opcional)

- `GET /tickets`  
  Lista chamados do usuário. Query params: `status`, `priority`, `dateFrom`, `dateTo`

- `GET /tickets/all`  
  (TI) Lista todos os chamados. Query params similares.

- `PUT /tickets/:id/status`  
  (TI) Atualiza status.  
  Body: `{ "status": "Em andamento" }`

- `POST /tickets/:id/comments`  
  (TI) Adiciona comentário.  
  Body: `{ "content": "Comentário..." }`

- `GET /tickets/:id/comments`  
  Lista comentários do chamado.

## Notas

- Para criar um usuário TI, altere manualmente o campo `role` no banco de dados para `TI`.
