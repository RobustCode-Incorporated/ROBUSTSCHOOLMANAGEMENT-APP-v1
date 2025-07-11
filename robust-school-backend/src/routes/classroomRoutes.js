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
    const list = await Classroom.findAll();
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

// Supprimer une classe
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Classroom.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Classe introuvable' });
    }
    res.json({ message: 'Classe supprimée' });
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;