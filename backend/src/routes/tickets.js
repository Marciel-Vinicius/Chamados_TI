// backend/src/routes/tickets.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Ticket, Comment, Op, User } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const notificationEmitter = require('../sse'); // <-- usa o emissor compartilhado

// ---------- uploads ----------
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// autenticação para rotas abaixo
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

    // Emite evento de novo chamado (só TI deve processar na SSE)
    notificationEmitter.emit('notify', {
      type: 'new-ticket',
      ticket: {
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        userId: ticket.userId,
        creator: {
          id: ticket.User?.id,
          email: ticket.User?.email,
          setor: ticket.User?.setor
        }
      }
    });

    return res.status(201).json(ticket);
  } catch (err) {
    console.error('[POST /tickets] erro ao criar chamado:', err);
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
    console.error('[GET /tickets] erro ao listar meus chamados:', err);
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
    console.error('[GET /tickets/all] erro ao listar chamados TI:', err);
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
