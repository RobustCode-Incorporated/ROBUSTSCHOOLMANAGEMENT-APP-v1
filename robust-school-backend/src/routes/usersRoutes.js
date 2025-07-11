const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Récupérer tous les utilisateurs
router.get('/', usersController.getAllUsers);

// Créer un nouvel utilisateur
router.post('/', usersController.createUser);

// Supprimer un utilisateur par ID
router.delete('/:id', usersController.deleteUser);

// Modifier un utilisateur par ID
router.put('/:id', usersController.updateUser);

module.exports = router;