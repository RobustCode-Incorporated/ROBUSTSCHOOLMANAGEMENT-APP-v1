const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const TimetableEntry = require('../models/TimetableEntry');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const TeachingAssignment = require('../models/TeachingAssignment');

// ✅ Créer un créneau horaire (admin uniquement)
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { professorId, subjectId, classroomId, date, startTime, endTime, location } = req.body;

    if (!date) return res.status(400).json({ message: 'Date requise.' });
    if (startTime >= endTime) return res.status(400).json({ message: 'Heure de début doit précéder l\'heure de fin.' });

    // Création du créneau
    const entry = await TimetableEntry.create({ professorId, subjectId, classroomId, date, startTime, endTime, location });

    // 🔁 Créer une affectation si elle n'existe pas encore
    await TeachingAssignment.findOrCreate({
      where: {
        subjectId,
        professorId,
        classroomId
      }
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Lister tous les créneaux (admin uniquement)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const list = await TimetableEntry.findAll({
      include: [
        { model: User, as: 'timetableProfessor', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'timetableSubject', attributes: ['name'] },
        { model: Classroom, as: 'timetableClassroom', attributes: ['name', 'level'] }
      ]
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Emploi du temps du professeur connecté
router.get('/professeur', authMiddleware(['prof']), async (req, res) => {
  try {
    const timetable = await TimetableEntry.findAll({
      where: { professorId: req.user.id },
      include: [
        { model: Subject, as: 'timetableSubject' },
        { model: Classroom, as: 'timetableClassroom' },
        { model: User, as: 'timetableProfessor', attributes: ['firstName', 'lastName'] }
      ]
    });
    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});



// ✅ Modifier un créneau horaire (admin uniquement)
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const entry = await TimetableEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: req.t('errors.not_found') });

    const { date, startTime, endTime } = req.body;
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Format de date invalide (attendu: YYYY-MM-DD)' });
    }

    if (startTime && endTime && startTime >= endTime) {
      return res.status(400).json({ message: 'Heure de début doit précéder l\'heure de fin.' });
    }

    await entry.update(req.body);
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Supprimer un créneau horaire (admin uniquement)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const deleted = await TimetableEntry.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: req.t('errors.not_found') });

    res.json({ message: req.t('messages.delete_success') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// ✅ Emploi du temps d’un élève basé sur ses inscriptions aux matières
router.get('/eleve', authMiddleware(['eleve']), async (req, res) => {
  try {
    const { StudentSubject } = require('../models');

    const inscriptions = await StudentSubject.findAll({ where: { studentId: req.user.id } });
    const subjectIds = inscriptions.map(i => i.subjectId);

    if (subjectIds.length === 0) return res.json([]);

    const timetable = await TimetableEntry.findAll({
      where: { subjectId: subjectIds },
      attributes: ['id', 'date', 'startTime', 'endTime', 'location'], // ✅ Inclure ici les champs de base
      include: [
        { model: Subject, as: 'timetableSubject', attributes: ['name', 'code'] },
        { model: User, as: 'timetableProfessor', attributes: ['firstName', 'lastName'] },
        { model: Classroom, as: 'timetableClassroom', attributes: ['name', 'level'] }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    res.json(timetable);
  } catch (err) {
    console.error('Erreur emploi du temps élève:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;