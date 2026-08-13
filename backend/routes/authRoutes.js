const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Aturan validasi untuk registrasi
// Referensi: express-validator - https://express-validator.github.io/docs/
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
];

// Aturan validasi untuk login
const loginValidation = [
  body('email').isEmail().withMessage('Format email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

// Route Definitions
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe); // Protected: butuh JWT

module.exports = router;
