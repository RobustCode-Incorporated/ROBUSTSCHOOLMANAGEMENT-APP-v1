const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const Document = require('../models/Document');
const router = express.Router();

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 🔽 Upload de document (admin ou prof)
router.post('/', authMiddleware(['admin', 'prof']), upload.single('file'), async (req, res) => {
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
    const docs = await Document.findAll({ where: { classroomId } });
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

    const docs = await Document.findAll({ where: filters });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
});

// 🔽 Télécharger un document
router.get('/download/:filename', authMiddleware(['eleve', 'prof', 'admin']), (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../../uploads', filename);
  const fs = require('fs');
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });
  }
});

const fs = require('fs');

// 🔴 Supprimer un document
router.delete('/:id', authMiddleware(['admin', 'prof']), async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Supprimer le fichier physique
    const filepath = path.join(__dirname, '../../uploads', doc.filename);
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