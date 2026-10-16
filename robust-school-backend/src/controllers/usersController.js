

const { Op } = require('sequelize');
const User = require('../models/User');
const Note = require('../models/Note');
const { archiveFilter, deleteOrArchive, restoreHandler } = require('../utils/archive');
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6),
  role: Joi.string().valid('admin', 'prof', 'eleve').required()
});

exports.getAllUsers = async (req, res) => {
  try {
    const whereClause = archiveFilter(req);
    if (req.query.role) {
      whereClause.role = req.query.role.toLowerCase();
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body, { presence: 'required' });
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    const { firstName, lastName, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Le mot de passe est requis' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
    });

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l’utilisateur.' });
  }
};

// Un utilisateur ayant des notes (élève ou prof) est archivé, pas supprimé
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const { archived } = await deleteOrArchive(user, () =>
      Note.count({ where: { [Op.or]: [{ studentId: user.id }, { professorId: user.id }] } })
    );
    res.json({
      archived,
      message: archived
        ? 'Utilisateur archivé : il a des notes, elles sont conservées.'
        : 'Utilisateur supprimé avec succès.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l’utilisateur.' });
  }
};

exports.restoreUser = restoreHandler(User, 'Utilisateur');

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, password, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const { error } = userSchema.validate({ firstName, lastName, email, password, role }, { presence: 'optional' });
    if (error) {
      return res.status(400).json({ message: 'Données invalides', detail: error.details });
    }

    let updateData = { firstName, lastName, email };
    if (role) updateData.role = role.toLowerCase();

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    res.json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l’utilisateur.' });
  }
};