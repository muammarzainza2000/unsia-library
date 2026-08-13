import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

const CATEGORIES = ['Teknologi','Sains','Matematika','Bahasa','Sejarah','Ekonomi','Hukum','Kedokteran','Lainnya'];

const initialForm = {
  title: '', author: '', isbn: '', category: 'Teknologi',
  publisher: '', publishYear: '', totalStock: 1, description: '',
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchBooks(); }, [page, search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', { params: { page, limit: 8, search } });
      setBooks(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditBook(null);
    setForm(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      category: book.category, publisher: book.publisher || '',
      publishYear: book.publishYear || '', totalStock: book.totalStock,
      description: book.description || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editBook) {
        await api.put(`/books/${editBook._id}`, form);
      } else {
        await api.post('/books', form);
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus buku ini?')) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus buku');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>📚 Data Buku</h1>
        <p>Kelola koleksi buku perpustakaan UNSIA</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Cari judul, penulis, ISBN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Buku</button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading">⏳ Memuat data...</div>
          ) : books.length === 0 ? (
            <div className="loading">📭 Tidak ada data buku</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Penulis</th>
                  <th>ISBN</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Tersedia</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn}</td>
                    <td><span className="badge badge-info">{book.category}</span></td>
                    <td>{book.totalStock}</td>
                    <td>
                      <span className={`badge ${book.availableStock > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.availableStock}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
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

      {/* Modal Tambah/Edit Buku */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editBook ? '✏️ Edit Buku' : '➕ Tambah Buku'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Judul Buku *</label>
                <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Penulis *</label>
                  <input className="form-control" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>ISBN *</label>
                  <input className="form-control" value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategori *</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stok Total *</label>
                  <input type="number" min="1" className="form-control" value={form.totalStock} onChange={e => setForm({...form, totalStock: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Penerbit</label>
                  <input className="form-control" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Tahun Terbit</label>
                  <input type="number" className="form-control" value={form.publishYear} onChange={e => setForm({...form, publishYear: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? '⏳ Menyimpan...' : '💾 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Books;
