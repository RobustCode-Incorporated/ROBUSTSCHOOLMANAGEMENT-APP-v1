const express = require('express');
const router = express.Router();
const { User, Subject, Document } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

// Import du routeur timetableRoutes
const timetableRoutes = require('./timetableRoutes');

// Route stats
router.get('/stats', authMiddleware(['admin']), async (req, res) => {
  try {
    const students = await User.count({ where: { role: 'eleve', archivedAt: null } });
    const teachers = await User.count({ where: { role: 'prof', archivedAt: null } });
    const subjects = await Subject.count({ where: { archivedAt: null } });
    const documents = await Document.count();

    res.json({
      students,
      teachers,
      subjects,
      documents,
    });
  } catch (error) {
    console.error('Erreur chargement stats admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Délégation des routes /admin/timetable vers timetableRoutes
router.use('/timetable', timetableRoutes);

module.exports = router;