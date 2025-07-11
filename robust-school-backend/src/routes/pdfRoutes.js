const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { generateBulletinPDF } = require('../utils/pdfGenerator');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Note = require('../models/Note');
const Subject = require('../models/Subject');

router.get('/bulletin/:studentId', authMiddleware(['eleve', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Sécurité : si élève, ne peut demander que son propre bulletin
    if (req.user.role === 'eleve' && req.user.id !== studentId) {
      return res.status(403).json({ message: req.t('errors.forbidden') });
    }

    // Récupérer infos élève, classe et notes
    const student = await User.findByPk(studentId);
    if (!student) return res.status(404).json({ message: 'Élève non trouvé' });

    // On suppose qu’un élève a une classe, à récupérer ici
    const classroom = await Classroom.findOne({ 
      include: [{
        model: User,
        as: 'students',
        where: { id: studentId }
      }]
    });

    if (!classroom) return res.status(404).json({ message: 'Classe non trouvée' });

    const notes = await Note.findAll({
      where: { studentId },
      include: [{ model: Subject, as: 'subject' }]
    });

    const pdfBuffer = await generateBulletinPDF(student, classroom, notes);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=bulletin_${student.lastName}_${student.firstName}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;