const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getMembers, createMember, updateMember, deleteMember } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

const memberValidation = [
  body('name').trim().notEmpty().withMessage('Nama anggota wajib diisi'),
  body('nim').trim().notEmpty().withMessage('NIM wajib diisi'),
  body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
];

router.use(protect);

router.get('/', getMembers);
router.post('/', memberValidation, createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
