const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { StudentSubject, Subject, TeachingAssignment, Classroom, User } = require('../models');

// ✅ Récupérer les matières d’un élève connecté avec prof et classe
router.get('/', authMiddleware(['eleve']), async (req, res) => {
  try {
    const subjects = await StudentSubject.findAll({
      where: { studentId: req.user.id },
      include: [{
        model: Subject,
        include: [{
          model: TeachingAssignment,
          as: 'teachingAssignments',
          include: [
            { model: User, as: 'assignedProfessor', attributes: ['firstName', 'lastName'] },
            { model: Classroom, as: 'assignedClassroom', attributes: ['name', 'level'] }
          ]
        }]
      }]
    });

    // 🧠 On extrait uniquement les données utiles pour le frontend
    const result = subjects.map(s => {
      const subj = s.Subject?.toJSON?.() || {};
      const assignment = subj.teachingAssignments?.[0];

      return {
        id: subj.id,
        name: subj.name,
        code: subj.code,
        professor: assignment?.assignedProfessor || null,
        classroom: assignment?.assignedClassroom || null
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Erreur récupération matières élève:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ S’enregistrer à une matière
router.post('/', authMiddleware(['eleve']), async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId requis.' });
    }

    const alreadyExists = await StudentSubject.findOne({
      where: {
        studentId: req.user.id,
        subjectId
      }
    });

    if (alreadyExists) {
      return res.status(400).json({ message: 'Déjà inscrit à cette matière.' });
    }

    const newLink = await StudentSubject.create({
      studentId: req.user.id,
      subjectId
    });

    res.status(201).json(newLink);
  } catch (err) {
    console.error('Erreur inscription matière:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ✅ Se désinscrire d’une matière
router.delete('/:subjectId', authMiddleware(['eleve']), async (req, res) => {
  try {
    const { subjectId } = req.params;

    const deleted = await StudentSubject.destroy({
      where: {
        studentId: req.user.id,
        subjectId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Inscription non trouvée.' });
    }

    res.json({ message: 'Désinscription réussie.' });
  } catch (err) {
    console.error('Erreur désinscription matière:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;