

const Note = require('../models/Note');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Classroom = require('../models/Classroom');
const Joi = require('joi');

const noteSchema = Joi.object({
  value: Joi.number().min(0).max(20).required(),
  subjectId: Joi.string().required(),
  classroomId: Joi.string().required(),
  studentId: Joi.string().required(),
});

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      include: [
        { model: User, as: 'student', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Classroom, as: 'classroom', attributes: ['name', 'level'] }
      ]
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des notes.' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { error } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const note = await Note.create(req.body);
    res.status(201).json({ message: 'Note ajoutée avec succès', id: note.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’ajout de la note.' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { error } = noteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const note = await Note.findByPk(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée.' });
    }

    await note.update(req.body);
    res.json({ message: 'Note mise à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la note.' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Note non trouvée.' });
    }

    res.json({ message: 'Note supprimée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la note.' });
  }
};