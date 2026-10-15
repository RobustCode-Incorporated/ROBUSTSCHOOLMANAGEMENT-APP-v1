const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/authMiddleware');
const Document = require('../models/Document');
const User = require('../models/User');
const StudentAssignment = require('../models/StudentAssignment');
const StudentSubject = require('../models/StudentSubject');
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Types de fichiers autorisés (pas de .html, .svg, .js, exécutables…)
const ALLOWED_EXTENSIONS = [
  '.pdf', '.txt', '.csv',
  '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp',
  '.jpg', '.jpeg', '.png', '.gif', '.webp'
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo

// Configuration Multer : nom de fichier aléatoire, extension contrôlée
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
    }
    cb(null, true);
  }
});

// Upload avec messages d'erreur clairs (400 au lieu de 500)
const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (20 Mo maximum).' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: `Type de fichier non autorisé. Formats acceptés : ${ALLOWED_EXTENSIONS.join(', ')}` });
    }
    next(err);
  });
};

// Filtre des documents qu'un élève a le droit de voir :
// ceux de ses classes ou des matières auxquelles il est inscrit
async function studentDocumentScope(studentId) {
  const [student, assignments, enrollments] = await Promise.all([
    User.findByPk(studentId, { attributes: ['classroomId'] }),
    StudentAssignment.findAll({ where: { studentId }, attributes: ['classroomId'] }),
    StudentSubject.findAll({ where: { studentId }, attributes: ['subjectId'] })
  ]);

  const classroomIds = assignments.map(a => a.classroomId);
  if (student?.classroomId) classroomIds.push(student.classroomId);
  const subjectIds = enrollments.map(e => e.subjectId);

  return {
    [Op.or]: [
      { classroomId: { [Op.in]: classroomIds } },
      { subjectId: { [Op.in]: subjectIds } }
    ]
  };
}

async function visibleWhere(req, filters = {}) {
  if (req.user.role !== 'eleve') return filters;
  return { [Op.and]: [filters, await studentDocumentScope(req.user.id)] };
}

// 🔽 Upload de document (admin ou prof)
router.post('/', authMiddleware(['admin', 'prof']), uploadSingle, async (req, res) => {
  try {
    const { classroomId, subjectId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Aucun fichier reçu' });

    const doc = await Document.create({
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      uploadedBy: req.user.id,
      classroomId,
      subjectId
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// 🔼 Lister les documents d’une classe
router.get('/classroom/:classroomId', authMiddleware(['eleve', 'prof', 'admin']), async (req, res) => {
  try {
    const { classroomId } = req.params;
    const docs = await Document.findAll({ where: await visibleWhere(req, { classroomId }) });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// 🔼 Lister tous les documents (filtrable par classe et matière)
router.get('/', authMiddleware(['eleve', 'prof', 'admin']), async (req, res) => {
  try {
    const { classroomId, subjectId } = req.query;
    const filters = {};
    if (classroomId) filters.classroomId = classroomId;
    if (subjectId) filters.subjectId = subjectId;

    const docs = await Document.findAll({ where: await visibleWhere(req, filters) });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// 🔽 Télécharger un document
router.get('/download/:filename', authMiddleware(['eleve', 'prof', 'admin']), async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const doc = await Document.findOne({ where: await visibleWhere(req, { filename }) });
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!doc || !fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });
    }
    res.download(filepath, doc.originalName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// 🔴 Supprimer un document (un prof ne supprime que les siens)
router.delete('/:id', authMiddleware(['admin', 'prof']), async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc || (req.user.role === 'prof' && doc.uploadedBy !== req.user.id)) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Supprimer le fichier physique
    const filepath = path.join(UPLOAD_DIR, path.basename(doc.filename));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await doc.destroy();
    res.json({ message: 'Document supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

module.exports = router;
