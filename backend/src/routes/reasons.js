// backend/src/routes/reasons.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { Reason } = require('../models');

router.use(auth);

/**
 * Listar motivos
 */
router.get('/', async (req, res) => {
    try {
        const reasons = await Reason.findAll({ order: [['name', 'ASC']] });
        return res.json(reasons);
    } catch (err) {
        console.error('[GET /reasons] erro:', err);
        return res.status(500).json({ message: 'Erro ao listar motivos', error: err.message });
    }
});

/**
 * Criar motivo (TI)
 */
router.post('/', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome do motivo é obrigatório.' });
        const existing = await Reason.findOne({ where: { name: name.trim() } });
        if (existing) return res.status(409).json({ message: 'Motivo já existe.' });
        const reason = await Reason.create({ name: name.trim() });
        return res.status(201).json(reason);
    } catch (err) {
        console.error('[POST /reasons] erro:', err);
        return res.status(500).json({ message: 'Erro ao criar motivo', error: err.message });
    }
});

/**
 * Atualizar motivo (TI)
 */
router.put('/:id', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        const reason = await Reason.findByPk(req.params.id);
        if (!reason) return res.status(404).json({ message: 'Motivo não encontrado.' });
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome do motivo é obrigatório.' });
        reason.name = name.trim();
        await reason.save();
        return res.json(reason);
    } catch (err) {
        console.error('[PUT /reasons/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao atualizar motivo', error: err.message });
    }
});

/**
 * Deletar motivo (TI)
 */
router.delete('/:id', role(['TI']), async (req, res) => {
    try {
        const reason = await Reason.findByPk(req.params.id);
        if (!reason) return res.status(404).json({ message: 'Motivo não encontrado.' });
        await reason.destroy();
        return res.json({ message: 'Motivo removido.' });
    } catch (err) {
        console.error('[DELETE /reasons/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao deletar motivo', error: err.message });
    }
});

module.exports = router;
