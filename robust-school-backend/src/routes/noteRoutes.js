const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Note = require('../models/Note');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const TeachingAssignment = require('../models/TeachingAssignment');
const StudentSubject = require('../models/StudentSubject');
const Joi = require('joi');

// Seuls ces champs sont modifiables ; une note reste entre 0 et 20
const noteFields = {
  value: Joi.number().min(0).max(20),
  comment: Joi.string().allow('', null),
  date: Joi.date().iso()
};
const createNoteSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  subjectId: Joi.string().uuid().required(),
  ...noteFields,
  value: noteFields.value.required()
});
const updateNoteSchema = Joi.object(noteFields).min(1);

// ✅ Créer une note (professeur)
router.post('/', authMiddleware(['prof']), async (req, res) => {
  try {
    const { error, value: body } = createNoteSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: 'Données invalides : ' + error.details[0].message });
    }
    const { studentId, subjectId, value, comment = '', date = new Date() } = body;

    const teachingAssignment = await TeachingAssignment.findOne({
      where: {
        professorId: req.user.id,
        subjectId
      }
    });

    if (!teachingAssignment) {
      return res.status(403).json({ message: 'Vous n’êtes pas autorisé à noter cette matière' });
    }

    // L'élève doit être inscrit à la matière
    const enrollment = await StudentSubject.findOne({ where: { studentId, subjectId } });
    if (!enrollment) {
      return res.status(403).json({ message: 'Cet élève n’est pas inscrit à cette matière' });
    }

    const classroomId = teachingAssignment.classroomId;

    const note = await Note.create({
      studentId,
      professorId: req.user.id,
      subjectId,
      classroomId,
      value,
      comment,
      date
    });

    res.status(201).json(note);
  } catch (err) {
    console.error('Erreur création note:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Récupérer les notes (élève ou admin)
router.get('/', authMiddleware(['eleve', 'admin']), async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'eleve') {
      whereClause.studentId = req.user.id;
    }

    const notes = await Note.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'eleve', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'professeur', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Classroom, as: 'classroom', attributes: ['name', 'level'] }
      ]
    });

    res.json(notes);
  } catch (err) {
    console.error('Erreur chargement notes élève/admin:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Récupérer toutes les notes (admin)
router.get('/all', authMiddleware(['admin']), async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [
        { model: User, as: 'eleve', attributes: ['firstName', 'lastName'] },
        { model: User, as: 'professeur', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Classroom, as: 'classroom', attributes: ['name', 'level'] }
      ]
    });

    res.json(notes);
  } catch (err) {
    console.error('Erreur chargement notes admin:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Récupérer les notes saisies par le professeur connecté
router.get('/professeur', authMiddleware(['prof']), async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { professorId: req.user.id },
      include: [
        { model: User, as: 'eleve', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Classroom, as: 'classroom', attributes: ['name', 'level'] }
      ]
    });

    res.json(notes);
  } catch (err) {
    console.error('Erreur chargement notes prof:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Modifier une note (uniquement ses propres notes)
router.put('/:id', authMiddleware(['prof']), async (req, res) => {
  try {
    const { error, value: changes } = updateNoteSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({ message: 'Données invalides : ' + error.details[0].message });
    }

    const note = await Note.findOne({ where: { id: req.params.id, professorId: req.user.id } });
    if (!note) {
      return res.status(404).json({ message: 'Note introuvable' });
    }

    await note.update(changes);
    res.json({ message: 'Note mise à jour' });
  } catch (err) {
    console.error('Erreur mise à jour note:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer une note (uniquement ses propres notes)
router.delete('/:id', authMiddleware(['prof']), async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id, professorId: req.user.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Note introuvable' });
    }

    res.json({ message: 'Note supprimée' });
  } catch (err) {
    console.error('Erreur suppression note:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;