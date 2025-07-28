const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Ticket, Comment, Op } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.use(auth);

// Usuário comum
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : null;
    const ticket = await Ticket.create({ title, description, category, priority, attachment, userId: req.user.id });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar chamado', error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { status, priority, dateFrom, dateTo } = req.query;
  let where = { userId: req.user.id };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
  }
  const tickets = await Ticket.findAll({ where });
  res.json(tickets);
});

// Equipe TI
router.get('/all', role(['TI']), async (req, res) => {
  const { status, priority, dateFrom, dateTo } = req.query;
  let where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
  }
  const tickets = await Ticket.findAll({ where });
  res.json(tickets);
});

router.put('/:id/status', role(['TI']), async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Chamado não encontrado' });
    ticket.status = status;
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar status', error: err.message });
  }
});

router.post('/:id/comments', role(['TI']), async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({ content, ticketId: req.params.id, userId: req.user.id });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao adicionar comentário', error: err.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  const comments = await Comment.findAll({ where: { ticketId: req.params.id } });
  res.json(comments);
});

module.exports = router;
