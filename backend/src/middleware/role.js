// backend/src/middleware/role.js
module.exports = function (requiredRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles];
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Sem permissão.' });
    }
    next();
  };
};
