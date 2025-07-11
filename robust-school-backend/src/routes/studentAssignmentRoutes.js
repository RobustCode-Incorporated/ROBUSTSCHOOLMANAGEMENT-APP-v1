const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const StudentAssignment = require('../models/StudentAssignment');
const User = require('../models/User');
const Classroom = require('../models/Classroom');

// Créer une affectation élève
router.post('/', authMiddleware(['admin',]), async (req, res) => {
  try {
    const { studentId, classroomId } = req.body;
    if (!studentId || !classroomId) {
      return res.status(400).json({ message: 'studentId et classroomId sont requis' });
    }

    const assignment = await StudentAssignment.create({ studentId, classroomId });
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Lister toutes les affectations élèves
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const assignments = await StudentAssignment.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Classroom, as: 'classroom', attributes: ['id', 'name', 'level'] }
      ]
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Supprimer une affectation élève
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await StudentAssignment.destroy({ where: { id } });
    res.json({ message: 'Affectation élève supprimée' });
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;