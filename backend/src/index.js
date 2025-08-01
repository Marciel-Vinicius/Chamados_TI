// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const auth = require('./middleware/auth');
const notificationEmitter = require('./sse');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const reasonRoutes = require('./routes/reasons');
const categoryRoutes = require('./routes/categories');
const priorityRoutes = require('./routes/priorities');
const sectorRoutes = require('./routes/sectors');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (FRONTEND_URL === '*' || origin === FRONTEND_URL) return callback(null, true);
      return callback(new Error('CORS não permitido'), false);
    },
    credentials: true
  })
);

// serve attachments
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// public / open routes
app.use('/auth', authRoutes);
app.use('/sectors', sectorRoutes);
app.use('/reasons', reasonRoutes);
app.use('/categories', categoryRoutes);
app.use('/priorities', priorityRoutes);

// SSE: ticket stream
app.get(
  '/tickets/stream',
  // allow token in querystring as fallback
  (req, res, next) => {
    if (req.query.token && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${req.query.token}`;
    }
    next();
  },
  auth,
  (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ msg: 'connected' })}\n\n`);

    const user = req.user;

    const handler = payload => {
      try {
        if (payload.type === 'new-ticket') {
          if (user.role !== 'TI') return;
          res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
        }
        else if (payload.type === 'new-comment') {
          const { ticketOwnerId, comment } = payload;
          if (user.role === 'TI') {
            res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
          } else if (user.id === ticketOwnerId && comment.userId !== user.id) {
            res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
          }
        }
      } catch (e) {
        console.error('[SSE handler] erro ao enviar evento:', e);
      }
    };

    notificationEmitter.on('notify', handler);

    // keep‐alive pings
    const keepAlive = setInterval(() => {
      res.write(`event: ping\ndata: {}\n\n`);
    }, 20_000);

    req.on('close', () => {
      clearInterval(keepAlive);
      notificationEmitter.off('notify', handler);
    });
  }
);

// protected ticket routes
app.use('/tickets', ticketRoutes);

// healthcheck
app.get('/', (req, res) => res.send('OK'));

// start server after syncing DB
(async () => {
  try {
    // automatically add/remove columns to match your models
    await sequelize.sync({ alter: true });
    console.log('✅ Banco sincronizado (com alter)');

    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao sincronizar o banco:', err);
    process.exit(1);
  }
})();
