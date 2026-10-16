const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');

// Profil de l'utilisateur connecté (déclaré avant /:id)
router.get('/me', authMiddleware(['admin', 'prof', 'eleve']), usersController.getMe);

// Récupérer tous les utilisateurs
router.get('/', authMiddleware(['admin']), usersController.getAllUsers);

// Créer un nouvel utilisateur
router.post('/', authMiddleware(['admin']), usersController.createUser);

// Supprimer un utilisateur par ID
router.delete('/:id', authMiddleware(['admin']), usersController.deleteUser);

// Restaurer un utilisateur archivé
router.post('/:id/restore', authMiddleware(['admin']), usersController.restoreUser);

// Modifier un utilisateur par ID
router.put('/:id', authMiddleware(['admin']), usersController.updateUser);

module.exports = router;
