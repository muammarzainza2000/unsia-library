const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama anggota wajib diisi'],
      trim: true,
    },
    nim: {
      type: String,
      required: [true, 'NIM wajib diisi'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    phone: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema);
