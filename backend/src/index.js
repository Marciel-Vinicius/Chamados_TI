// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('./models');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const notificationEmitter = require('./sse');

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SSE stream (antes do authMiddleware aplicado globalmente em /tickets)
app.get('/tickets/stream', async (req, res) => {
  let rawToken = req.query.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!rawToken) {
    console.warn('[SSE] token ausente na rota /tickets/stream');
    return res.status(401).end('Token ausente');
  }

  // limpeza simples
  rawToken = rawToken.trim();
  if (rawToken.startsWith('Bearer ')) rawToken = rawToken.slice(7);
  if (rawToken.startsWith('"') && rawToken.endsWith('"')) rawToken = rawToken.slice(1, -1);

  // verify
  let payload;
  try {
    payload = jwt.verify(rawToken, process.env.JWT_SECRET);
  } catch (err) {
    console.warn('[SSE] token inválido/expirado na stream:', err.message);
    return res.status(401).end('Token inválido ou expirado');
  }

  const user = await User.findByPk(payload.id);
  if (!user) {
    console.warn('[SSE] usuário não encontrado na stream:', payload);
    return res.status(401).end('Usuário inválido');
  }

  // cabeçalhos SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*' // caso o front esteja em outra origem
  });
  res.flushHeaders?.();

  // keepalive
  const keepAlive = setInterval(() => {
    res.write(':\n\n');
  }, 25000);

  // confirma conexão
  res.write(`event: connected\ndata: ${JSON.stringify({ user: { id: user.id, role: user.role } })}\n\n`);

  const handler = (payload) => {
    try {
      if (payload.type === 'new-ticket') {
        if (user.role !== 'TI') return;
        res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
      } else if (payload.type === 'new-comment') {
        const { ticketOwnerId } = payload;
        if (user.role === 'TI' || user.id === ticketOwnerId) {
          res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
        }
      }
    } catch (e) {
      console.error('[SSE] erro ao enviar evento:', e);
    }
  };

  notificationEmitter.on('notify', handler);

  req.on('close', () => {
    clearInterval(keepAlive);
    notificationEmitter.off('notify', handler);
  });
});

// rotas normais
app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes); // ticketRoutes já aplica auth internamente

// sincroniza e sobe
(async () => {
  await sequelize.sync();
  console.log('✅ Banco sincronizado');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
  );
})();
