// backend/src/routes/tickets.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { Ticket, Comment, Op, User, Reason, Category, Priority } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
// 👇 Corrigido: precisa desestruturar o emitter
const { notificationEmitter } = require('../sse');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// aplica auth em todas as rotas abaixo
router.use(auth);

/** ------------------------- SSE (alias) -------------------------
 *  Mantém compatibilidade com o front que chama /tickets/stream
 *  Repassa apenas eventos relacionados a tickets (payload.ticketId)
 *  ---------------------------------------------------------------- */
router.get('/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  if (res.flushHeaders) res.flushHeaders();

  // ping de keepalive a cada 25s (evita proxies fecharem)
  const keepAlive = setInterval(() => res.write(`:keepalive\n\n`), 25000);

  const onNotify = (payload) => {
    if (!payload || !payload.ticketId) return; // só eventos de ticket
    const id = payload.id || `evt-${uuidv4()}`;
    res.write(`event: ticket\n`);
    res.write(`id: ${id}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  notificationEmitter.on('notify', onNotify);

  req.on('close', () => {
    clearInterval(keepAlive);
    notificationEmitter.off('notify', onNotify);
  });
});

/** Criar chamado */
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, reasonId, categoryId, priorityId } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const payload = { title, description, attachment, userId: req.user.id };
    if (reasonId) payload.reasonId = reasonId;

    if (categoryId) {
      payload.categoryId = categoryId;
      const cat = await Category.findByPk(categoryId);
      if (cat) payload.category = cat.name; // campo legado textual (se existir)
    }

    if (priorityId) {
      payload.priorityId = priorityId;
      const pr = await Priority.findByPk(priorityId);
      if (pr) payload.priority = pr.name; // campo legado textual (se existir)
    }

    let ticket = await Ticket.create(payload);
    ticket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, attributes: ['id', 'email', 'setor', 'role'] },
        Reason && { model: Reason },
        Category && { model: Category },
        Priority && { model: Priority },
      ].filter(Boolean),
    });

    // notifica criação
    notificationEmitter.emit('notify', {
      id: `ticket-${ticket.id}`,
      type: 'new-ticket',
      ticketId: ticket.id,
      title: ticket.title,
      description: ticket.description,
      createdAt: ticket.createdAt,
      user: { id: ticket.User.id, email: ticket.User.email, role: ticket.User.role },
      status: ticket.status,
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error('[POST /tickets] erro:', err);
    res.status(400).json({ message: 'Erro ao criar chamado', error: err.message });
  }
});

/** Listar meus chamados */
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
    const tickets = await Ticket.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [Reason && { model: Reason }, Category && { model: Category }, Priority && { model: Priority }].filter(Boolean),
    });
    res.json(tickets);
  } catch (err) {
    console.error('[GET /tickets] erro:', err);
    res.status(500).json({ message: 'Erro ao listar chamados', error: err.message });
  }
});

/** Listar todos (TI) */
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
    const tickets = await Ticket.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'email', 'setor', 'role'] },
        Reason && { model: Reason },
        Category && { model: Category },
        Priority && { model: Priority },
      ].filter(Boolean),
    });
    res.json(tickets);
  } catch (err) {
    console.error('[GET /tickets/all] erro:', err);
    res.status(500).json({ message: 'Erro ao listar chamados TI', error: err.message });
  }
});

/** Detalhar chamado */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'email', 'setor', 'role'] },
        Reason && { model: Reason },
        Category && { model: Category },
        Priority && { model: Priority },
      ].filter(Boolean),
    });
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado.' });

    if (req.user.role === 'common' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }

    if (req.user.role === 'TI' && !ticket.viewedByTI) {
      ticket.viewedByTI = true;
      await ticket.save();
    }

    res.json(ticket);
  } catch (err) {
    console.error('[GET /tickets/:id] erro:', err);
    res.status(500).json({ message: 'Erro ao buscar detalhes', error: err.message });
  }
});

/** Atualizar status */
router.put('/:id/status', role(['TI']), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado' });

    ticket.status = req.body.status;
    await ticket.save();

    // notifica atualização de status
    notificationEmitter.emit('notify', {
      id: `ticket-status-${ticket.id}-${Date.now()}`,
      type: 'ticket_updated',
      ticketId: ticket.id,
      title: `Chamado #${ticket.id} atualizado`,
      message: `Status: ${ticket.status}`,
      status: ticket.status,
      updatedAt: new Date().toISOString(),
    });

    res.json(ticket);
  } catch (err) {
    console.error('[PUT /tickets/:id/status] erro:', err);
    res.status(400).json({ message: 'Erro ao atualizar status', error: err.message });
  }
});

/** Adicionar comentário */
router.post('/:id/comments', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado' });

    if (req.user.role === 'common' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão para comentar.' });
    }

    const comment = await Comment.create({
      content: req.body.content,
      ticketId: ticket.id,
      userId: req.user.id,
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'email', 'setor'] }],
    });

    // notifica novo comentário
    notificationEmitter.emit('notify', {
      id: `comment-${fullComment.id}`,
      type: 'new-comment',
      ticketId: ticket.id,
      ticketOwnerId: ticket.userId,
      content: fullComment.content,
      createdAt: fullComment.createdAt,
      user: { id: fullComment.User.id, email: fullComment.User.email },
    });

    res.status(201).json(fullComment);
  } catch (err) {
    console.error('[POST /tickets/:id/comments] erro:', err);
    res.status(400).json({ message: 'Erro ao adicionar comentário', error: err.message });
  }
});

/** Listar comentários */
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { ticketId: req.params.id },
      include: [{ model: User, attributes: ['id', 'email', 'setor'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    console.error('[GET /tickets/:id/comments] erro:', err);
    res.status(500).json({ message: 'Erro ao listar comentários', error: err.message });
  }
});

module.exports = router;
