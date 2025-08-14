// backend/src/routes/categories.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { Category } = require('../models');

router.use(auth);

/**
 * Listar categorias
 */
router.get('/', async (req, res) => {
    try {
        const cats = await Category.findAll({ order: [['name', 'ASC']] });
        return res.json(cats);
    } catch (err) {
        console.error('[GET /categories] erro:', err);
        return res.status(500).json({ message: 'Erro ao listar categorias', error: err.message });
    }
});

/**
 * Criar categoria (TI)
 */
router.post('/', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        const existing = await Category.findOne({ where: { name: name.trim() } });
        if (existing) return res.status(409).json({ message: 'Categoria já existe.' });
        const cat = await Category.create({ name: name.trim() });
        return res.status(201).json(cat);
    } catch (err) {
        console.error('[POST /categories] erro:', err);
        return res.status(500).json({ message: 'Erro ao criar categoria', error: err.message });
    }
});

/**
 * Atualizar categoria (TI)
 */
router.put('/:id', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        const cat = await Category.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ message: 'Categoria não encontrada.' });
        if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório.' });
        cat.name = name.trim();
        await cat.save();
        return res.json(cat);
    } catch (err) {
        console.error('[PUT /categories/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao atualizar categoria', error: err.message });
    }
});

/**
 * Deletar categoria (TI)
 */
router.delete('/:id', role(['TI']), async (req, res) => {
    try {
        const cat = await Category.findByPk(req.params.id);
        if (!cat) return res.status(404).json({ message: 'Categoria não encontrada.' });
        await cat.destroy();
        return res.json({ message: 'Categoria removida.' });
    } catch (err) {
        console.error('[DELETE /categories/:id] erro:', err);
        return res.status(500).json({ message: 'Erro ao deletar categoria', error: err.message });
    }
});

module.exports = router;
