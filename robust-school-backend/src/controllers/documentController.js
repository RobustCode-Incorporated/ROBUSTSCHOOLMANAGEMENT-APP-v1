const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');

// Upload document (admin ou prof)
exports.uploadDocument = async (req, res) => {
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
};

// Liste documents d’une classe
exports.getDocumentsByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const docs = await Document.findAll({ where: { classroomId } });
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
};

// Liste tous les documents (filtrables)
exports.getDocuments = async (req, res) => {
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
};

// Télécharger un document
exports.downloadDocument = (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ message: 'Fichier introuvable sur le serveur.' });
  }
};

// Supprimer un document (admin ou prof)
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document non trouvé' });

    // Supprimer le fichier physique
    const filepath = path.join(__dirname, '../../uploads', doc.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    await doc.destroy();
    res.json({ message: 'Document supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errors.server_error') });
  }
};