// backend/src/routes/priorities.js
const express = require('express');
const router = express.Router();
const { Priority } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', async (_req, res) => {
    const rows = await Priority.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
});

router.post('/', role(['TI']), async (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Priority.findOne({ where: { name } });
    if (exists) return res.status(409).json({ message: 'Já existe uma prioridade com esse nome.' });
    const row = await Priority.create({ name });
    res.status(201).json(row);
});

router.put('/:id', role(['TI']), async (req, res) => {
    const row = await Priority.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrada.' });
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Priority.findOne({ where: { name } });
    if (exists && exists.id !== row.id) {
        return res.status(409).json({ message: 'Já existe outra prioridade com esse nome.' });
    }
    row.name = name;
    await row.save();
    res.json(row);
});

router.delete('/:id', role(['TI']), async (req, res) => {
    const row = await Priority.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrada.' });
    try {
        await row.destroy();
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível excluir. Verifique vínculos com tickets.' });
    }
});

module.exports = router;
