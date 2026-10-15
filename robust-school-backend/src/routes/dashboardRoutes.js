const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware(['admin', 'prof', 'eleve']), (req, res) => {
  try {
    const userRole = req.user.role;
    let message = '';

    switch (userRole) {
      case 'admin':
        message = req.t('dashboard.admin_message');
        break;
      case 'prof':
        message = req.t('dashboard.prof_message');
        break;
      case 'eleve':
        message = req.t('dashboard.eleve_message');
        break;
      default:
        message = req.t('dashboard.default_message');
    }

    res.json({ message });
  } catch (error) {
    console.error('Erreur dans la route dashboard:', error);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;