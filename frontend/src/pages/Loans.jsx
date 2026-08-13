import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ bookId: '', memberId: '', dueDate: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchLoans(); }, [page, filterStatus]);
  useEffect(() => { fetchBooks(); fetchMembers(); }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans', { params: { page, limit: 8, status: filterStatus } });
      setLoans(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books', { params: { limit: 100 } });
      setBooks(res.data.data.filter(b => b.availableStock > 0));
    } catch (err) { console.error(err); }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members', { params: { limit: 100 } });
      setMembers(res.data.data.filter(m => m.isActive));
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await api.post('/loans', form);
      setShowModal(false);
      setForm({ bookId: '', memberId: '', dueDate: '', notes: '' });
      fetchLoans();
      fetchBooks(); // Refresh stok buku
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mencatat peminjaman');
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    if (!confirm('Konfirmasi pengembalian buku ini?')) return;
    try {
      await api.put(`/loans/${loanId}/return`);
      fetchLoans();
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian');
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (loan) => loan.status === 'borrowed' && new Date() > new Date(loan.dueDate);

  // Default dueDate: 7 hari dari sekarang
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Layout>
      <div className="page-header">
        <h1>📋 Data Peminjaman</h1>
        <p>Kelola transaksi peminjaman buku perpustakaan</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'borrowed', 'returned'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setFilterStatus(s); setPage(1); }}
              >
                {s === '' ? 'Semua' : s === 'borrowed' ? '🔖 Dipinjam' : '✅ Dikembalikan'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm({...form, dueDate: defaultDueDate}); }}>
            + Catat Peminjaman
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading">⏳ Memuat data...</div>
          ) : loans.length === 0 ? (
            <div className="loading">📭 Tidak ada data peminjaman</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Buku</th>
                  <th>Anggota</th>
                  <th>Tgl Pinjam</th>
                  <th>Jatuh Tempo</th>
                  <th>Tgl Kembali</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <strong>{loan.book?.title}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{loan.book?.author}</div>
                    </td>
                    <td>
                      {loan.member?.name}
                      <div style={{ fontSize: 12, color: '#64748b' }}>{loan.member?.nim}</div>
                    </td>
                    <td>{formatDate(loan.loanDate)}</td>
                    <td style={{ color: isOverdue(loan) ? '#dc2626' : 'inherit' }}>
                      {formatDate(loan.dueDate)}
                      {isOverdue(loan) && <div style={{ fontSize: 11, color: '#dc2626' }}>⚠️ Terlambat</div>}
                    </td>
                    <td>{formatDate(loan.returnDate)}</td>
                    <td>
                      <span className={`badge ${
                        loan.status === 'returned' ? 'badge-success' :
                        isOverdue(loan) ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {loan.status === 'returned' ? '✅ Kembali' :
                         isOverdue(loan) ? '⚠️ Terlambat' : '🔖 Dipinjam'}
                      </span>
                    </td>
                    <td>
                      {loan.status === 'borrowed' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(loan._id)}>
                          ↩️ Kembalikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Catat Peminjaman Buku</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pilih Buku * (hanya buku yang tersedia)</label>
                <select className="form-control" value={form.bookId} onChange={e => setForm({...form, bookId: e.target.value})} required>
                  <option value="">-- Pilih Buku --</option>
                  {books.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.title} — {b.author} (Stok: {b.availableStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pilih Anggota *</label>
                <select className="form-control" value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})} required>
                  <option value="">-- Pilih Anggota --</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name} — {m.nim}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, dueDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Catatan</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? '⏳ Memproses...' : '💾 Catat Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Loans;
