const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');


const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalBooks,
      totalMembers,
      totalLoans,
      activeLoans,
      returnedLoans,
      booksByCategory,
      loansByMonth,
    ] = await Promise.all([
      Book.countDocuments(),

      Member.countDocuments({ isActive: true }),

      Loan.countDocuments(),

      Loan.countDocuments({ status: 'borrowed' }),

      Loan.countDocuments({ status: 'returned' }),

      Book.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Loan.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const availableBooksAgg = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$availableStock' } } },
    ]);
    const totalAvailableStock = availableBooksAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBooks,
          totalMembers,
          totalLoans,
          activeLoans,
          returnedLoans,
          totalAvailableStock,
        },
        charts: {
          booksByCategory,
          loansByMonth,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardSummary };
