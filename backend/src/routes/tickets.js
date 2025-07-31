// backend/src/routes/tickets.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const { Ticket, Comment, Op, User } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ---------- validação de ambiente ----------
if (!process.env.JWT_SECRET) {
  console.error('⚠️ JWT_SECRET não está definido. Defina no .env sem aspas (ex: JWT_SECRET=seusegredo).');
}

// ---------- uploads ----------
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ---------- emitter global ----------
const notificationEmitter = new EventEmitter();

// ---------- utilitário de normalização de token ----------
function cleanToken(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let token = raw.trim();
  if (token.startsWith('Bearer ')) token = token.slice(7);
  if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
  return token;
}

// ---------- SSE stream ----------
router.get('/stream', async (req, res) => {
  let rawToken = req.query.token || req.headers.authorization;
  if (!rawToken) {
    console.warn('[SSE] token ausente');
    return res.status(401).end('Token ausente');
  }

  rawToken = cleanToken(rawToken);
  if (!rawToken) {
    console.warn('[SSE] token após limpeza inválido');
    return res.status(401).end('Token inválido');
  }

  console.log('[SSE] tentativa de conexão com token prefixo:', rawToken.slice(0, 8), '...');

  let payload;
  try {
    payload = jwt.verify(rawToken, process.env.JWT_SECRET);
  } catch (err) {
    console.warn('[SSE] falha na verificação do token:', err.message);
    return res.status(401).end('Token inválido ou expirado');
  }

  const user = await User.findByPk(payload.id);
  if (!user) {
    console.warn('[SSE] usuário do token não encontrado:', payload);
    return res.status(401).end('Usuário inválido');
  }

  // cabeçalhos SSE
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*' // caso front esteja em outra origem
  });
  res.flushHeaders?.();

  // keep-alive para manter a conexão viva
  const keepAlive = setInterval(() => {
    res.write(':\n\n');
  }, 25000);

  // confirma conexão
  res.write(`event: connected\ndata: ${JSON.stringify({ user: { id: user.id, role: user.role } })}\n\n`);

  const handler = (payload) => {
    try {
      if (payload.type === 'new-ticket') {
        if (user.role !== 'TI') return; // só TI recebe
        res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
      } else if (payload.type === 'new-comment') {
        const { ticketOwnerId } = payload;
        if (user.role === 'TI' || user.id === ticketOwnerId) {
          res.write(`event: notify\ndata: ${JSON.stringify(payload)}\n\n`);
        }
      }
    } catch (e) {
      console.error('[SSE] erro no handler:', e);
    }
  };

  notificationEmitter.on('notify', handler);

  req.on('close', () => {
    clearInterval(keepAlive);
    notificationEmitter.off('notify', handler);
  });
});

// rota auxiliar para verificar token rapidamente
router.get('/validate-token', (req, res) => {
  const raw = req.query.token;
  const token = cleanToken(raw);
  if (!token) return res.status(400).json({ error: 'Token ausente ou mal formatado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, decoded });
  } catch (err) {
    return res.status(400).json({ valid: false, error: err.message });
  }
});

// autenticação das demais rotas
router.use(auth);

/**
 * Criar chamado
 */
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      attachment,
      userId: req.user.id
    });

    await ticket.reload({
      include: [{ model: User, attributes: ['id', 'email', 'setor', 'role'] }]
    });

    notificationEmitter.emit('notify', {
      type: 'new-ticket',
      ticket: {
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        userId: ticket.userId
      }
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error('[POST /tickets] erro criar chamado:', err);
    return res.status(400).json({ message: 'Erro ao criar chamado', error: err.message });
  }
});

/**
 * Listar meus chamados
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, dateFrom, dateTo } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }
    const tickets = await Ticket.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json(tickets);
  } catch (err) {
    console.error('[GET /tickets] erro listar meus chamados:', err);
    return res.status(500).json({ message: 'Erro ao listar chamados', error: err.message });
  }
});

/**
 * Listar todos os chamados (TI)
 */
router.get('/all', role(['TI']), async (req, res) => {
  try {
    const { status, priority, dateFrom, dateTo } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }
    const tickets = await Ticket.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.json(tickets);
  } catch (err) {
    console.error('[GET /tickets/all] erro listar chamados TI:', err);
    return res.status(500).json({ message: 'Erro ao listar chamados TI', error: err.message });
  }
});

/**
 * Detalhar chamado
 */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: { model: User, attributes: ['id', 'email', 'setor', 'role'] }
    });
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado.' });
    if (req.user.role === 'common' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }
    return res.json(ticket);
  } catch (err) {
    console.error('[GET /tickets/:id] erro detalhe:', err);
    return res.status(500).json({ message: 'Erro ao buscar detalhes', error: err.message });
  }
});

/**
 * Atualizar status (TI)
 */
router.put('/:id/status', role(['TI']), async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado' });
    ticket.status = status;
    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    console.error('[PUT /tickets/:id/status] erro:', err);
    return res.status(400).json({ message: 'Erro ao atualizar status', error: err.message });
  }
});

/**
 * Adicionar comentário
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado' });
    if (req.user.role === 'common' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para comentar.' });
    }

    const comment = await Comment.create({
      content,
      ticketId: req.params.id,
      userId: req.user.id
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'email', 'setor'] }]
    });

    notificationEmitter.emit('notify', {
      type: 'new-comment',
      comment: fullComment,
      ticketOwnerId: ticket.userId,
      ticketId: ticket.id
    });

    return res.status(201).json(fullComment);
  } catch (err) {
    console.error('[POST /tickets/:id/comments] erro:', err);
    return res.status(400).json({ message: 'Erro ao adicionar comentário', error: err.message });
  }
});

/**
 * Listar comentários
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { ticketId: req.params.id },
      include: [{ model: User, attributes: ['id', 'email', 'setor'] }],
      order: [['createdAt', 'ASC']]
    });
    return res.json(comments);
  } catch (err) {
    console.error('[GET /tickets/:id/comments] erro:', err);
    return res.status(500).json({ message: 'Erro ao listar comentários', error: err.message });
  }
});

module.exports = router;
