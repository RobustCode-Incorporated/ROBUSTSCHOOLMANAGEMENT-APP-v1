const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const TeachingAssignment = require('../models/TeachingAssignment');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const StudentSubject = require('../models/StudentSubject');
const Joi = require('joi');

const assignmentSchema = Joi.object({
  professorId: Joi.string().uuid().required(),
  subjectId: Joi.string().uuid().required(),
  classroomId: Joi.string().uuid().required()
});

// ✅ Lister toutes les affectations (admin)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const assignments = await TeachingAssignment.findAll({
      include: [
        { model: User, as: 'assignedProfessor', attributes: ['id', 'firstName', 'lastName'] },
        { model: Subject, as: 'assignedSubject', attributes: ['id', 'name', 'code'] },
        { model: Classroom, as: 'assignedClassroom', attributes: ['id', 'name', 'level'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(assignments);
  } catch (err) {
    console.error('Erreur chargement affectations :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ Créer une affectation professeur + matière + classe (admin)
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { error, value } = assignmentSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: 'Données invalides : ' + error.details[0].message });
    }

    const professor = await User.findOne({ where: { id: value.professorId, role: 'prof' } });
    const [subject, classroom] = await Promise.all([
      Subject.findByPk(value.subjectId),
      Classroom.findByPk(value.classroomId)
    ]);
    if (!professor || !subject || !classroom) {
      return res.status(400).json({ message: 'Professeur, matière ou classe introuvable.' });
    }

    const [assignment, created] = await TeachingAssignment.findOrCreate({ where: value });
    if (!created) {
      return res.status(409).json({ message: 'Cette affectation existe déjà.' });
    }
    res.status(201).json(assignment);
  } catch (err) {
    console.error('Erreur création affectation :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ Supprimer une affectation (admin)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const deleted = await TeachingAssignment.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Affectation introuvable.' });
    }
    res.json({ message: 'Affectation supprimée.' });
  } catch (err) {
    console.error('Erreur suppression affectation :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

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