const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getBooks, createBook, updateBook, deleteBook, getBookById } = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

// Semua route buku memerlukan autentikasi JWT
// Referensi: Express Router - https://expressjs.com/en/guide/routing.html

const bookValidation = [
  body('title').trim().notEmpty().withMessage('Judul buku wajib diisi'),
  body('author').trim().notEmpty().withMessage('Nama penulis wajib diisi'),
  body('isbn').trim().notEmpty().withMessage('ISBN wajib diisi'),
  body('category').notEmpty().withMessage('Kategori wajib diisi'),
  body('totalStock')
    .isInt({ min: 1 })
    .withMessage('Stok harus berupa angka minimal 1'),
];

// Terapkan middleware protect ke semua route di sini
router.use(protect);

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', bookValidation, createBook);
router.put('/:id', bookValidation, updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
