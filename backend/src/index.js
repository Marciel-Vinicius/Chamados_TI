// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const authMiddleware = require('./middleware/auth');

const app = express();

// 1) Habilita CORS para o frontend em Vite (http://localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 2) Body parser JSON
app.use(express.json());

// 3) Rota estática para uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4) Rotas de autenticação e de tickets
app.use('/auth', authRoutes);
app.use('/tickets', authMiddleware, ticketRoutes);

// 5) Sincroniza o banco e inicia o servidor
(async () => {
  await sequelize.sync();
  console.log('✅ Banco sincronizado');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
  );
})();
