// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

// Listar
router.get('/', async (_req, res) => {
    const rows = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(rows);
});

// Criar
router.post('/', role(['TI']), async (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Category.findOne({ where: { name } });
    if (exists) return res.status(409).json({ message: 'Já existe uma categoria com esse nome.' });
    const row = await Category.create({ name });
    res.status(201).json(row);
});

// Atualizar
router.put('/:id', role(['TI']), async (req, res) => {
    const row = await Category.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrada.' });
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Nome é obrigatório.' });
    const exists = await Category.findOne({ where: { name } });
    if (exists && exists.id !== row.id) {
        return res.status(409).json({ message: 'Já existe outra categoria com esse nome.' });
    }
    row.name = name;
    await row.save();
    res.json(row);
});

// Excluir
router.delete('/:id', role(['TI']), async (req, res) => {
    const row = await Category.findByPk(req.params.id);
    if (!row) return res.status(404).json({ message: 'Não encontrada.' });
    try {
        await row.destroy();
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ message: 'Não foi possível excluir. Verifique vínculos com tickets.' });
    }
});

module.exports = router;
