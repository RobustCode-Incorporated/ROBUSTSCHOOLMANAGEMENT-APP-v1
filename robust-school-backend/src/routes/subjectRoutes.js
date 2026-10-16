const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const TeachingAssignment = require('../models/TeachingAssignment');
const StudentSubject = require('../models/StudentSubject');
const Joi = require('joi');
const Note = require('../models/Note');
const { archiveFilter, deleteOrArchive, restoreHandler } = require('../utils/archive');

const subjectFields = {
  name: Joi.string().trim(),
  code: Joi.string().trim(),
  coefficient: Joi.number().integer().min(1)
};
const createSubjectSchema = Joi.object(subjectFields).options({ presence: 'required' });
const updateSubjectSchema = Joi.object(subjectFields).min(1);

function subjectError(res, err) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Ce code de matière existe déjà.' });
  }
  console.error(err);
  return res.status(500).json({ message: res.req.t('errors.server_error') });
}

// ✅ Créer une matière
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { error, value } = createSubjectSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: 'Données invalides : ' + error.details[0].message });
    }
    const subject = await Subject.create(value);
    res.status(201).json(subject);
  } catch (err) {
    subjectError(res, err);
  }
});

// ✅ Lister toutes les matières
router.get('/', authMiddleware(['admin', 'prof', 'eleve']), async (req, res) => {
  try {
    const subjects = await Subject.findAll({ where: archiveFilter(req) });
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
        { model: Subject, as: 'assignedSubject', attributes: ['id', 'name', 'code'], where: { archivedAt: null } },
        { model: User, as: 'assignedProfessor', attributes: ['firstName', 'lastName'], where: { archivedAt: null } },
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
    const { error, value } = updateSubjectSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: 'Données invalides : ' + error.details[0].message });
    }
    const [updated] = await Subject.update(value, { where: { id } });
    if (updated === 0) {
      return res.status(404).json({ message: 'Matière introuvable' });
    }
    res.json({ message: 'Matière mise à jour' });
  } catch (err) {
    subjectError(res, err);
  }
});

// ✅ Supprimer une matière (archivée si elle a des notes)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière introuvable' });
    }
    const { archived } = await deleteOrArchive(subject, () =>
      Note.count({ where: { subjectId: subject.id } })
    );
    res.json({
      archived,
      message: archived ? 'Matière archivée : elle a des notes, elles sont conservées.' : 'Matière supprimée'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Restaurer une matière archivée
router.post('/:id/restore', authMiddleware(['admin']), restoreHandler(Subject, 'Matière'));

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
          attributes: ['id', 'firstName', 'lastName'],
          where: { archivedAt: null }
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