const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const TeachingAssignment = require('../models/TeachingAssignment');
const StudentSubject = require('../models/StudentSubject');

// ✅ Créer une matière
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { name, code, coefficient } = req.body;
    const subject = await Subject.create({ name, code, coefficient });
    res.status(201).json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Lister toutes les matières
router.get('/', authMiddleware(['admin', 'prof', 'eleve']), async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Lister les matières disponibles pour l’inscription (avec profs et classes)
router.get('/available', authMiddleware(['eleve']), async (req, res) => {
  try {
    const assignments = await TeachingAssignment.findAll({
      include: [
        { model: Subject, as: 'assignedSubject', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'assignedProfessor', attributes: ['firstName', 'lastName'] },
        { model: Classroom, as: 'assignedClassroom', attributes: ['name', 'level'] }
      ]
    });

    const formatted = assignments.map(a => ({
      id: a.assignedSubject.id,
      name: a.assignedSubject.name,
      code: a.assignedSubject.code,
      professor: a.assignedProfessor,
      classroom: a.assignedClassroom
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Erreur chargement matières disponibles:', err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Lister les matières auxquelles l’élève est inscrit (avec profs + classes)
router.get('/enrolled', authMiddleware(['eleve']), async (req, res) => {
  try {
    const enrolledSubjects = await StudentSubject.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: Subject,
          include: [
            {
              model: TeachingAssignment,
              as: 'teachingAssignments',
              include: [
                { model: User, as: 'assignedProfessor', attributes: ['firstName', 'lastName'] },
                { model: Classroom, as: 'assignedClassroom', attributes: ['name', 'level'] }
              ]
            }
          ]
        }
      ]
    });

    const result = enrolledSubjects.map(es => {
      const subj = es.Subject;
      const assignment = subj.teachingAssignments?.[0];
      return {
        id: subj.id,
        name: subj.name,
        code: subj.code,
        professor: assignment?.assignedProfessor || null,
        classroom: assignment?.assignedClassroom || null
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Erreur récupération matières inscrites:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ Modifier une matière
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Subject.update(req.body, { where: { id } });
    if (updated === 0) {
      return res.status(404).json({ message: 'Matière introuvable' });
    }
    res.json({ message: 'Matière mise à jour' });
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Supprimer une matière
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Subject.destroy({ where: { id } });
    res.json({ message: 'Matière supprimée' });
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

router.get('/professor/enrolled-students', authMiddleware(['prof']), async (req, res) => {
  try {
    // 1. Obtenir les subjectId enseignés par le prof
    const assignments = await TeachingAssignment.findAll({
      where: { professorId: req.user.id },
      attributes: ['subjectId']
    });
    const subjectIds = assignments.map(a => a.subjectId);

    // 2. Trouver les élèves inscrits à ces matières
    const enrolled = await StudentSubject.findAll({
      where: { subjectId: subjectIds },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(enrolled);
  } catch (err) {
    console.error('Erreur chargement élèves inscrits:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;