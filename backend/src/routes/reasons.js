// backend/src/routes/reasons.js
const express = require('express');
const router = express.Router();
const { Reason } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', async (_req, res) => {
    const rows = await Reason.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
});

router.post('/', role(['TI']), async (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Reason.findOne({ where: { name } });
    if (exists) return res.status(409).json({ message: 'Já existe um motivo com esse nome.' });
    const row = await Reason.create({ name });
    res.status(201).json(row);
});

router.put('/:id', role(['TI']), async (req, res) => {
    const row = await Reason.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrado.' });
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Reason.findOne({ where: { name } });
    if (exists && exists.id !== row.id) {
        return res.status(409).json({ message: 'Já existe outro motivo com esse nome.' });
    }
    row.name = name;
    await row.save();
    res.json(row);
});

router.delete('/:id', role(['TI']), async (req, res) => {
    const row = await Reason.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrado.' });
    try {
        await row.destroy();
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível excluir. Verifique vínculos com tickets.' });
    }
});

module.exports = router;
