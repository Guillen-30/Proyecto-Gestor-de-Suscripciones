const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser } = require('../controllers/userController');

// Importamos nuestro nuevo Middleware
const { verificarToken } = require('../middleware/auth');

// Rutas PÚBLICAS (No necesitan token)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas PRIVADAS (Protegidas por el middleware verificarToken)
router.put('/:id', verificarToken, updateUser);
router.delete('/:id', verificarToken, deleteUser);

module.exports = router;