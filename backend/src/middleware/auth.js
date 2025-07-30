// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Não autenticado.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Usuário inválido.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};
