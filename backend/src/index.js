// backend/src/index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

/**
 * CORS robusto: aceita múltiplos origins.
 * Use FRONTEND_URLS (separado por vírgula) e/ou FRONTEND_URL (único).
 * Ex.: FRONTEND_URLS=http://localhost:5173,http://localhost:5174,https://seu-dominio.com
 */
const envList = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const single = (process.env.FRONTEND_URL || '').trim();

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = Array.from(new Set([
  ...DEFAULT_DEV_ORIGINS,
  ...(single ? [single] : []),
  ...envList,
]));

app.use(cors({
  origin: allowedOrigins, // o pacote 'cors' reflete a origin se estiver na lista
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // não usamos cookies; token vai no header/query
  optionsSuccessStatus: 204,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rotas
app.use('/notifications', require('./routes/notifications'));
app.use('/auth', require('./routes/auth'));
app.use('/tickets', require('./routes/tickets'));
app.use('/categories', require('./routes/categories'));
app.use('/reasons', require('./routes/reasons'));
app.use('/priorities', require('./routes/priorities'));
app.use('/sectors', require('./routes/sectors'));

app.get('/health', (_, res) => res.json({ ok: true, allowedOrigins }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  console.log('CORS allowed origins:', allowedOrigins);
});
