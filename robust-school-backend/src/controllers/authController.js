const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Joi = require('joi');

exports.register = async (req, res) => {
  const t = req.t; // Fonction de traduction i18next
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'prof', 'eleve').required()
  });

  const body = {
    ...req.body,
    role: req.body.role?.toLowerCase()
  }

  const { error } = schema.validate(body);
  if (error) {
    return res.status(400).json({ message: t('errors.invalid_data'), detail: error.details });
  }

  try {
    const existing = await User.findOne({ where: { email: body.email } });
    if (existing) {
      return res.status(400).json({ message: t('errors.email_exists') });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await User.create({
      ...body,
      password: hashedPassword
    });

    res.status(201).json({ message: t('messages.registration_success'), userId: newUser.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t('errors.server_error') });
  }
};

exports.login = async (req, res) => {
  const t = req.t;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: t('errors.invalid_data') });
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).json({ message: t('errors.invalid_credentials') });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: t('errors.invalid_credentials') });
    }

    const tokenPayload = { id: user.id, role: user.role };
    if (user.role === 'eleve') {
      tokenPayload.classroomId = user.classroomId;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: t('messages.login_success'),
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        ...(user.role === 'eleve' && { classroomId: user.classroomId })
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t('errors.server_error') });
  }
};