const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Judul buku wajib diisi'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Nama penulis wajib diisi'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN wajib diisi'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori wajib diisi'],
      enum: [
        'Teknologi',
        'Sains',
        'Matematika',
        'Bahasa',
        'Sejarah',
        'Ekonomi',
        'Hukum',
        'Kedokteran',
        'Lainnya',
      ],
      default: 'Lainnya',
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishYear: {
      type: Number,
      min: [1000, 'Tahun tidak valid'],
      max: [new Date().getFullYear(), 'Tahun tidak boleh melebihi tahun sekarang'],
    },
    totalStock: {
      type: Number,
      required: [true, 'Stok total wajib diisi'],
      min: [0, 'Stok tidak boleh negatif'],
      default: 1,
    },
    availableStock: {
      type: Number,
      min: [0, 'Stok tersedia tidak boleh negatif'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableStock = this.totalStock;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
