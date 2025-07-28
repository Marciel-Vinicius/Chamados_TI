# Frontend do Sistema de Chamados TI

## Descrição
Aplicação React + Tailwind CSS para frontend do sistema de chamados de TI.

## Instalação

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd frontend
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Copie `.env.example` para `.env` e ajuste a variável:
   ```
   REACT_APP_API_URL=http://localhost:3000
   ```
4. Inicie em modo desenvolvimento:
   ```bash
   npm run dev
   ```

## Páginas

- `/login`: Tela de login  
- `/tickets`: Listagem de chamados do usuário  
- `/tickets/new`: Abertura de novo chamado  
- `/tickets/:id`: Detalhes do chamado (usuário)  
- `/admin`: Painel de gerenciamento de chamados pela equipe de TI  

## Proteção de Rotas
Utiliza `react-router-dom` e componentes protegidos via token JWT em `localStorage`.
