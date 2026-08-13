const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getLoans, createLoan, returnLoan } = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

const loanValidation = [
  body('bookId').notEmpty().withMessage('ID buku wajib diisi'),
  body('memberId').notEmpty().withMessage('ID anggota wajib diisi'),
  body('dueDate').isISO8601().withMessage('Format tanggal jatuh tempo tidak valid'),
];

router.use(protect);

router.get('/', getLoans);
router.post('/', loanValidation, createLoan);
router.put('/:id/return', returnLoan);

module.exports = router;
