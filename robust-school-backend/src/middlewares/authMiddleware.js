const jwt = require('jsonwebtoken');

function authMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ message: req.t ? req.t('errors.unauthorized') : 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: req.t ? req.t('errors.unauthorized') : 'Unauthorized' });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.error('Erreur JWT :', err);
          return res.status(403).json({ message: req.t ? req.t('errors.forbidden') : 'Forbidden' });
        }

        // Normalize role to lowercase for consistent checks
        const userRole = (user.role || '').toLowerCase();
        console.log('Role dans token:', userRole);

        if (requiredRoles.length > 0 && !requiredRoles.map(r => r.toLowerCase()).includes(userRole)) {
          return res.status(403).json({ message: req.t ? req.t('errors.forbidden') : 'Forbidden' });
        }

        // Attach user info to req for later use
        req.user = { ...user, role: userRole };
        next();
      });
    } catch (error) {
      console.error('Erreur middleware auth:', error);
      return res.status(500).json({ message: req.t ? req.t('errors.server_error') : 'Internal Server Error' });
    }
  };
}

module.exports = authMiddleware;