const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Data buku wajib diisi'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member', 
      required: [true, 'Data anggota wajib diisi'],
    },
    loanDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Tanggal jatuh tempo wajib diisi'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    notes: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    },
  },
  {
    timestamps: true,
  }
);

loanSchema.virtual('isOverdue').get(function () {
  return this.status === 'borrowed' && new Date() > this.dueDate;
});

module.exports = mongoose.model('Loan', loanSchema);
