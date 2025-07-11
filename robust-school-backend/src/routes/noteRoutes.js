const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Note = require('../models/Note');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const TeachingAssignment = require('../models/TeachingAssignment');

// ✅ Créer une note (professeur)
router.post('/', authMiddleware(['prof']), async (req, res) => {
  try {
    const { studentId, subjectId, value, comment = '', date = new Date() } = req.body;

    if (!studentId || !subjectId || value == null) {
      return res.status(400).json({ message: 'studentId, subjectId et value sont requis' });
    }

    const teachingAssignment = await TeachingAssignment.findOne({
      where: {
        professorId: req.user.id,
        subjectId
      }
    });

    if (!teachingAssignment) {
      return res.status(403).json({ message: 'Vous n’êtes pas autorisé à noter cette matière' });
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

// ✅ Modifier une note
router.put('/:id', authMiddleware(['prof']), async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Note.update(req.body, { where: { id } });

    if (updated === 0) {
      return res.status(404).json({ message: 'Note introuvable' });
    }

    res.json({ message: 'Note mise à jour' });
  } catch (err) {
    console.error('Erreur mise à jour note:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ Supprimer une note
router.delete('/:id', authMiddleware(['prof']), async (req, res) => {
  try {
    const { id } = req.params;
    await Note.destroy({ where: { id } });

    res.json({ message: 'Note supprimée' });
  } catch (err) {
    console.error('Erreur suppression note:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;