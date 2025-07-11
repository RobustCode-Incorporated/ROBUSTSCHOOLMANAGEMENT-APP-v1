

const Classroom = require('../models/Classroom');
const Joi = require('joi');

const classroomSchema = Joi.object({
  name: Joi.string().required(),
  level: Joi.string().required(),
  academicYear: Joi.string().required(),
});

exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.findAll();
    res.json(classrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des classes.' });
  }
};

exports.createClassroom = async (req, res) => {
  try {
    const { error } = classroomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const newClass = await Classroom.create(req.body);
    res.status(201).json({ message: 'Classe créée avec succès', id: newClass.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la classe.' });
  }
};

exports.updateClassroom = async (req, res) => {
  try {
    const { error } = classroomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classe non trouvée.' });
    }

    await classroom.update(req.body);
    res.json({ message: 'Classe mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la classe.' });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    const deleted = await Classroom.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Classe non trouvée.' });
    }
    res.json({ message: 'Classe supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de la classe.' });
  }
};