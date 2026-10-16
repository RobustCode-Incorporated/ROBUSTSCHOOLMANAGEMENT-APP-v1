const Joi = require('joi');
const classroomSchema = Joi.object({
  name: Joi.string().required(),
  level: Joi.string().required(),
  academicYear: Joi.string().required()
});
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Classroom = require('../models/Classroom');
const Note = require('../models/Note');
const { archiveFilter, deleteOrArchive, restoreHandler } = require('../utils/archive');

// Créer une classe
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { error } = classroomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }
    const { name, level, academicYear } = req.body;
    const classroom = await Classroom.create({ name, level, academicYear });
    res.status(201).json(classroom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Lister toutes les classes
router.get('/', authMiddleware(['admin', 'prof', 'eleve']), async (req, res) => {
  try {
    const list = await Classroom.findAll({ where: archiveFilter(req) });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Modifier une classe
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID reçu :', id);
    console.log('Body reçu :', req.body);
    
    const [updated] = await Classroom.update(req.body, { where: { id } });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Classe introuvable ou aucune modification' });
    }

    res.json({ message: 'Classe mise à jour' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour :', err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Supprimer une classe (archivée si elle a des notes)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classe introuvable' });
    }
    const { archived } = await deleteOrArchive(classroom, () =>
      Note.count({ where: { classroomId: classroom.id } })
    );
    res.json({
      archived,
      message: archived ? 'Classe archivée : elle a des notes, elles sont conservées.' : 'Classe supprimée'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// Restaurer une classe archivée
router.post('/:id/restore', authMiddleware(['admin']), restoreHandler(Classroom, 'Classe'));

module.exports = router;