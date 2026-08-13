const { validationResult } = require('express-validator');
const Book = require('../models/Book');


const getBooks = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    // Bangun query filter dinamis
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: books,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: errors.array() });
  }

  try {
    // Cek apakah ISBN sudah ada
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      return res.status(400).json({ success: false, message: 'ISBN sudah terdaftar' });
    }

    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const updateBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: errors.array() });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }


    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Buku berhasil diupdate', data: updatedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }

    await book.deleteOne();
    res.status(200).json({ success: true, message: 'Buku berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook, getBookById };
