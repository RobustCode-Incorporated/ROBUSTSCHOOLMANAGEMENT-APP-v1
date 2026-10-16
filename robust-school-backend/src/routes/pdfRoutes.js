const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { generateBulletinPDF } = require('../utils/pdfGenerator');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const StudentAssignment = require('../models/StudentAssignment');

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

    // Classe de l'élève : affectation (student_assignments), sinon User.classroomId,
    // sinon la classe de sa note la plus récente
    const assignment = await StudentAssignment.findOne({
      where: { studentId },
      include: [{ model: Classroom, as: 'classroom' }],
      order: [['createdAt', 'DESC']]
    });
    const lastNote = await Note.findOne({
      where: { studentId, classroomId: { [Op.ne]: null } },
      order: [['date', 'DESC']]
    });
    const classroom = assignment?.classroom
      || (student.classroomId && await Classroom.findByPk(student.classroomId))
      || (lastNote && await Classroom.findByPk(lastNote.classroomId));

    if (!classroom) return res.status(404).json({ message: 'Classe non trouvée' });

    const notes = await Note.findAll({
      where: { studentId },
      include: [{ model: Subject, as: 'subject' }]
    });

    const pdfBuffer = await generateBulletinPDF(student, classroom, notes);

    // res.attachment encode correctement les noms accentués
    res.attachment(`bulletin_${student.lastName}_${student.firstName}.pdf`);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;