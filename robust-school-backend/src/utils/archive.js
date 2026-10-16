const { Op } = require('sequelize');

// Filtre des listes : actifs par défaut, archivés avec ?archived=true (admin)
function archiveFilter(req) {
  if (req.query.archived === 'true' && req.user?.role === 'admin') {
    return { archivedAt: { [Op.ne]: null } };
  }
  return { archivedAt: null };
}

// Supprime l'élément, ou l'archive s'il a un historique (notes) à conserver
async function deleteOrArchive(record, hasHistory) {
  if (await hasHistory()) {
    await record.update({ archivedAt: new Date() });
    return { archived: true };
  }
  await record.destroy();
  return { archived: false };
}

// Route admin POST /:id/restore commune
function restoreHandler(Model, label) {
  return async (req, res) => {
    try {
      const record = await Model.findByPk(req.params.id);
      if (!record || !record.archivedAt) {
        return res.status(404).json({ message: `${label} archivé(e) introuvable.` });
      }
      await record.update({ archivedAt: null });
      res.json({ message: `${label} restauré(e).` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  };
}

module.exports = { archiveFilter, deleteOrArchive, restoreHandler };
