const StudentSubject = require('../models/StudentSubject');
const Subject = require('../models/Subject');
const User = require('../models/User');

exports.enroll = async (req, res) => {
  const studentId = req.user.id; // Récupéré depuis token JWT
  const { subjectId } = req.body;

  if (!subjectId) {
    return res.status(400).json({ message: 'L\'identifiant de la matière est requis.' });
  }

  try {
    // Vérifier si l'inscription existe déjà
    const existing = await StudentSubject.findOne({ where: { studentId, subjectId } });
    if (existing) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette matière.' });
    }

    // Créer l'inscription
    await StudentSubject.create({ studentId, subjectId });
    res.status(201).json({ message: 'Inscription à la matière réussie.' });
  } catch (error) {
    console.error('Erreur inscription matière:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getEnrolledSubjects = async (req, res) => {
  const studentId = req.user.id;

  try {
    const user = await User.findByPk(studentId, {
      include: {
        model: Subject,
        as: 'enrolledSubjects',
        attributes: ['id', 'name', 'code', 'coefficient']
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Élève non trouvé.' });
    }

    res.json(user.enrolledSubjects);
  } catch (error) {
    console.error('Erreur récupération matières inscrites:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.unenroll = async (req, res) => {
  const studentId = req.user.id;
  const { subjectId } = req.params;

  try {
    const deleted = await StudentSubject.destroy({ where: { studentId, subjectId } });
    if (deleted === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }
    res.json({ message: 'Désinscription réussie.' });
  } catch (error) {
    console.error('Erreur désinscription matière:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};