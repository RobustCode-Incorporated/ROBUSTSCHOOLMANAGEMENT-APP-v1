const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const TeachingAssignment = require('../models/TeachingAssignment');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const StudentSubject = require('../models/StudentSubject');

// ✅ Lister les affectations d’un professeur connecté avec studentsCount
router.get('/professor', authMiddleware(['prof']), async (req, res) => {
  try {
    // Récupérer toutes les affectations du prof, avec matière et classe
    const assignments = await TeachingAssignment.findAll({
      where: { professorId: req.user.id },
      include: [
        { model: Subject, as: 'assignedSubject', attributes: ['id', 'name', 'code'] },
        { model: Classroom, as: 'assignedClassroom', attributes: ['id', 'name', 'level'] }
      ]
    });

    // Pour chaque affectation, compter le nombre d'élèves inscrits à la matière (subjectId)
    const results = await Promise.all(assignments.map(async (assignment) => {
      const studentsCount = await StudentSubject.count({
        where: { subjectId: assignment.subjectId }
      });

      return {
        id: assignment.id,
        subjectId: assignment.subjectId,
        professorId: assignment.professorId,
        classroomId: assignment.classroomId,
        assignedSubject: assignment.assignedSubject,
        assignedClassroom: {
          ...assignment.assignedClassroom?.toJSON(),
          studentsCount
        }
      };
    }));

    res.json(results);
  } catch (err) {
    console.error('Erreur chargement affectations prof :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;