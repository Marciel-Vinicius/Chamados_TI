// backend/src/routes/sectors.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { Sector } = require('../models');

router.use(express.json());

/**
 * Listar setores (aberto, sem autenticação obrigatória)
 */
router.get('/', async (req, res) => {
    try {
        const sectors = await Sector.findAll({ order: [['name', 'ASC']] });
        return res.json(sectors);
    } catch (err) {
        console.error('[GET /sectors] erro:', err);
        return res.status(500).json({ message: 'Erro ao listar setores', error: err.message });
    }
});

/**
 * Criar setor (TI)
 */
router.post('/', auth, role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        const existing = await Sector.findOne({ where: { name: name.trim() } });
        if (existing) return res.status(409).json({ message: 'Setor já existe.' });
        const sector = await Sector.create({ name: name.trim() });
        return res.status(201).json(sector);
    } catch (err) {
        console.error('[POST /sectors] erro:', err);
        return res.status(500).json({ message: 'Erro ao criar setor', error: err.message });
    }
});

/**
 * Atualizar setor (TI)
 */
router.put('/:id', auth, role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        const sector = await Sector.findByPk(req.params.id);
        if (!sector) return res.status(404).json({ message: 'Setor não encontrado.' });
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        sector.name = name.trim();
        await sector.save();
        return res.json(sector);
    } catch (err) {
        console.error('[PUT /sectors/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao atualizar setor', error: err.message });
    }
});

/**
 * Deletar setor (TI)
 */
router.delete('/:id', auth, role(['TI']), async (req, res) => {
    try {
        const sector = await Sector.findByPk(req.params.id);
        if (!sector) return res.status(404).json({ message: 'Setor não encontrado.' });
        await sector.destroy();
        return res.json({ message: 'Setor removido.' });
    } catch (err) {
        console.error('[DELETE /sectors/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao deletar setor', error: err.message });
    }
});

module.exports = router;
