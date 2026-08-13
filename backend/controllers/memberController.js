const { validationResult } = require('express-validator');
const Member = require('../models/Member');


const getMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nim: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const createMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validasi gagal', errors: errors.array() });
  }

  try {
    const existingMember = await Member.findOne({
      $or: [{ nim: req.body.nim }, { email: req.body.email }],
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'NIM atau email sudah terdaftar' });
    }

    const member = await Member.create(req.body);
    res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan', data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }

    const updatedMember = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Data anggota berhasil diupdate', data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
    }

    await member.deleteOne();
    res.status(200).json({ success: true, message: 'Anggota berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getMembers, createMember, updateMember, deleteMember };
