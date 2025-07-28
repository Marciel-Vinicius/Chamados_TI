require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita CORS só da URL do front
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log(`Database synced, iniciando servidor na porta ${PORT}`);
    // garante que o servidor escute em todas interfaces
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server rodando em http://localhost:${PORT}`)
    );
  })
  .catch(err => console.error(err));
