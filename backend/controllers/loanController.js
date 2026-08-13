const { validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const Book = require('../models/Book');

const getLoans = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.status = status;

    const total = await Loan.countDocuments(query);

    const loans = await Loan.find(query)
      .populate('book', 'title author isbn')
      .populate('member', 'name nim email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: loans.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: loans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createLoan = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: errors.array() });
  }

  const { bookId, memberId, dueDate, notes } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    if (book.availableStock <= 0) {
      return res.status(400).json({ success: false, message: 'Stok buku tidak tersedia' });
    }

    const loan = await Loan.create({
      book: bookId,
      member: memberId,
      dueDate,
      notes,
      processedBy: req.user._id,
    });

    await Book.findByIdAndUpdate(bookId, { $inc: { availableStock: -1 } });

    const populatedLoan = await Loan.findById(loan._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name nim email')
      .populate('processedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Peminjaman berhasil dicatat',
      data: populatedLoan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
    }
    if (loan.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Buku sudah dikembalikan sebelumnya' });
    }

    loan.status = 'returned';
    loan.returnDate = new Date();
    await loan.save();

    await Book.findByIdAndUpdate(loan.book, { $inc: { availableStock: 1 } });

    const updatedLoan = await Loan.findById(loan._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name nim email');

    res.status(200).json({
      success: true,
      message: 'Pengembalian buku berhasil dicatat',
      data: updatedLoan,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getLoans, createLoan, returnLoan };
