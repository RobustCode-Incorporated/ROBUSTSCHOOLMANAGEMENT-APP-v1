

const Subject = require('../models/Subject');
const Joi = require('joi');

const subjectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
});

exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.findAll();
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des matières.' });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { error } = subjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const newSubject = await Subject.create(req.body);
    res.status(201).json({ message: 'Matière créée avec succès', id: newSubject.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la matière.' });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { error } = subjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée.' });
    }

    await subject.update(req.body);
    res.json({ message: 'Matière mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la matière.' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Matière non trouvée.' });
    }
    res.json({ message: 'Matière supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la matière.' });
  }
};