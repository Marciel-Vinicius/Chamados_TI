// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7);
  if (!token && req.query && req.query.token) token = String(req.query.token);

  if (!token) return res.status(401).json({ message: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, sectorId, ... }
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
