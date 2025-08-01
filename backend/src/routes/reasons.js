// backend/src/routes/reasons.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { Reason } = require('../models');

// autenticação obrigatória
router.use(auth);

/**
 * Listar todos os motivos (qualquer usuário autenticado pode ver)
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
 * Criar motivo (somente TI)
 */
router.post('/', role(['TI']), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Nome do motivo é obrigatório.' });
        }
        const reason = await Reason.create({ name: name.trim() });
        return res.status(201).json(reason);
    } catch (err) {
        console.error('[POST /reasons] erro:', err);
        return res.status(400).json({ message: 'Erro ao criar motivo', error: err.message });
    }
});

module.exports = router;
