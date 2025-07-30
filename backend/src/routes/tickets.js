// backend/src/routes/tickets.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Ticket, Comment, Op, User } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Cria a pasta de uploads, se não existir
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuração do multer para salvar uploads em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Aplica autenticação em todas as rotas
router.use(auth);

/**
 * 1) Criar chamado
 *    POST /tickets
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
    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(400).json({
      message: 'Erro ao criar chamado',
      error: err.message
    });
  }
});

/**
 * 2) Listar meus chamados
 *    GET /tickets
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
    const tickets = await Ticket.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao listar chamados',
      error: err.message
    });
  }
});

/**
 * 3) Listar todos os chamados (TI)
 *    GET /tickets/all
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
    const tickets = await Ticket.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao listar todos os chamados',
      error: err.message
    });
  }
});

/**
 * 4) Detalhar um chamado
 *    GET /tickets/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: { model: User, attributes: ['id', 'email', 'setor'] }
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }
    if (req.user.role === 'common' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao buscar detalhes do chamado',
      error: err.message
    });
  }
});

/**
 * 5) Atualizar status (TI)
 *    PUT /tickets/:id/status
 */
router.put('/:id/status', role(['TI']), async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Chamado não encontrado' });
    }
    ticket.status = status;
    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    return res.status(400).json({
      message: 'Erro ao atualizar status',
      error: err.message
    });
  }
});

/**
 * 6) Adicionar comentário (qualquer usuário autenticado)
 *    POST /tickets/:id/comments
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    // só permite comentário se for owner ou TI
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
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(400).json({
      message: 'Erro ao adicionar comentário',
      error: err.message
    });
  }
});

/**
 * 7) Listar comentários
 *    GET /tickets/:id/comments
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
    return res.status(500).json({
      message: 'Erro ao listar comentários',
      error: err.message
    });
  }
});

module.exports = router;
