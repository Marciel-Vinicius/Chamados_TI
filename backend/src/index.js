// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const reasonRoutes = require('./routes/reasons');
const categoryRoutes = require('./routes/categories');
const priorityRoutes = require('./routes/priorities');
const auth = require('./middleware/auth');
const notificationEmitter = require('./sse');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// log simples das requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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

// rotas básicas de configuração
app.use('/auth', authRoutes);
app.use('/reasons', reasonRoutes);
app.use('/categories', categoryRoutes);
app.use('/priorities', priorityRoutes);

// SSE stream (deve vir antes de /tickets para não conflitar com /:id)
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
        } else if (payload.type === 'new-comment') {
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

    const keepAlive = setInterval(() => {
      res.write(`event: ping\ndata: {}\n\n`);
    }, 20_000);

    req.on('close', () => {
      clearInterval(keepAlive);
      notificationEmitter.off('notify', handler);
    });
  }
);

// montar tickets após SSE
app.use('/tickets', ticketRoutes);

// healthcheck
app.get('/', (req, res) => res.send('OK'));

// função que garante colunas obrigatórias na tabela Tickets (para SQLite)
async function ensureTicketColumns() {
  try {
    // limpa qualquer backup deixado por sync/alter anteriores
    await sequelize.query('DROP TABLE IF EXISTS "Tickets_backup";');

    const cols = await sequelize.query(`PRAGMA table_info('Tickets');`, {
      type: sequelize.QueryTypes.SELECT
    });

    const hasViewed = cols.some(c => c.name === 'viewedByTI');
    const hasReason = cols.some(c => c.name === 'reasonId');
    const hasCategoryId = cols.some(c => c.name === 'categoryId');
    const hasPriorityId = cols.some(c => c.name === 'priorityId');

    if (!hasViewed) {
      await sequelize.query(`ALTER TABLE Tickets ADD COLUMN viewedByTI BOOLEAN NOT NULL DEFAULT 0;`);
      console.log('Coluna viewedByTI adicionada em Tickets');
    }
    if (!hasReason) {
      await sequelize.query(`ALTER TABLE Tickets ADD COLUMN reasonId INTEGER;`);
      console.log('Coluna reasonId adicionada em Tickets');
    }
    if (!hasCategoryId) {
      await sequelize.query(`ALTER TABLE Tickets ADD COLUMN categoryId INTEGER;`);
      console.log('Coluna categoryId adicionada em Tickets');
    }
    if (!hasPriorityId) {
      await sequelize.query(`ALTER TABLE Tickets ADD COLUMN priorityId INTEGER;`);
      console.log('Coluna priorityId adicionada em Tickets');
    }
  } catch (err) {
    console.error('Erro em ensureTicketColumns:', err);
    throw err;
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    // garante colunas legadas antes do sync
    await ensureTicketColumns();
    // sincroniza sem usar alter para evitar lógica interna de changeColumn com backups conflitantes
    await sequelize.sync();
    console.log('✅ Banco sincronizado');
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao sincronizar o banco:', err);
    process.exit(1);
  }
})();
