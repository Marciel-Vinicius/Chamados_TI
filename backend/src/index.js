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
const FRONTEND_URL = process.env.FRONTEND_URL || '';

const extraOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = FRONTEND_URL === '*'
  ? null
  : Array.from(new Set([
    ...FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean),
    ...extraOrigins
  ]));

app.use(cors({
  origin: allowedOrigins === null
    ? true
    : (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Blocked by CORS: ${origin}`));
    },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/auth', authRoutes);

app.get(
  '/tickets/stream',
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
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ msg: 'connected' })}\n\n`);

    const user = req.user;
    const handler = payload => {
      try {
        if (payload.type === 'new-ticket') {
          if (user.role !== 'TI') return;
          res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
        } else if (payload.type === 'new-comment') {
          if (user.role === 'TI' || user.id === payload.ticketOwnerId) {
            res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
          }
        }
      } catch (e) {
        console.error('[SSE handler] erro ao enviar evento:', e);
      }
    };

    notificationEmitter.on('notify', handler);
    const keepAlive = setInterval(() => {
      res.write(`event: ping\ndata: {}\n\n`);
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      notificationEmitter.off('notify', handler);
    });
  }
);

app.use('/tickets', ticketRoutes);
app.use('/reasons', reasonRoutes);
app.use('/categories', categoryRoutes);
app.use('/priorities', priorityRoutes);
app.use('/sectors', sectorRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

(async () => {
  try {
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
