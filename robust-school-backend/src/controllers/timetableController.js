

const TimetableEntry = require('../models/TimetableEntry');
const Joi = require('joi');

const timetableSchema = Joi.object({
  day: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  subjectId: Joi.string().required(),
  classroomId: Joi.string().required(),
  teacherId: Joi.string().required(),
});

exports.getAllEntries = async (req, res) => {
  try {
    const entries = await TimetableEntry.findAll();
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des emplois du temps.' });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const { error } = timetableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const entry = await TimetableEntry.create(req.body);
    res.status(201).json({ message: 'Créneau ajouté', id: entry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’ajout du créneau.' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const { error } = timetableSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const entry = await TimetableEntry.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Créneau non trouvé.' });
    }

    await entry.update(req.body);
    res.json({ message: 'Créneau mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const deleted = await TimetableEntry.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Créneau non trouvé.' });
    }

    res.json({ message: 'Créneau supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};