// backend/src/routes/priorities.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { Priority } = require('../models');

router.use(auth);

/**
 * Listar prioridades
 */
router.get('/', async (req, res) => {
    try {
        const list = await Priority.findAll({ order: [['name', 'ASC']] });
        return res.json(list);
    } catch (err) {
        console.error('[GET /priorities] erro:', err);
        return res.status(500).json({ message: 'Erro ao listar prioridades', error: err.message });
    }
});

/**
 * Criar prioridade (TI)
 */
router.post('/', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        const existing = await Priority.findOne({ where: { name: name.trim() } });
        if (existing) return res.status(409).json({ message: 'Prioridade já existe.' });
        const p = await Priority.create({ name: name.trim() });
        return res.status(201).json(p);
    } catch (err) {
        console.error('[POST /priorities] erro:', err);
        return res.status(500).json({ message: 'Erro ao criar prioridade', error: err.message });
    }
});

/**
 * Atualizar prioridade (TI)
 */
router.put('/:id', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        const p = await Priority.findByPk(req.params.id);
        if (!p) return res.status(404).json({ message: 'Prioridade não encontrada.' });
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        p.name = name.trim();
        await p.save();
        return res.json(p);
    } catch (err) {
        console.error('[PUT /priorities/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao atualizar prioridade', error: err.message });
    }
});

/**
 * Deletar prioridade (TI)
 */
router.delete('/:id', role(['TI']), async (req, res) => {
    try {
        const p = await Priority.findByPk(req.params.id);
        if (!p) return res.status(404).json({ message: 'Prioridade não encontrada.' });
        await p.destroy();
        return res.json({ message: 'Prioridade removida.' });
    } catch (err) {
        console.error('[DELETE /priorities/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao deletar prioridade', error: err.message });
    }
});

module.exports = router;
