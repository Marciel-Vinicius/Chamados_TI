// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) return res.status(401).json({ message: 'Token ausente.' });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: 'JWT_SECRET não configurado.' });

    const payload = jwt.verify(token, secret);

    // opcional: buscar usuário no DB para garantir rol e existência
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Usuário inválido.' });

    // popula req.user com dados úteis
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      setor: user.setor
    };

    next();
  } catch (err) {
    console.error('[auth middleware] erro:', err);
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};
