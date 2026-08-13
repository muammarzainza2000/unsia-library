import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

const initialForm = { name: '', nim: '', email: '', phone: '', faculty: '', program: '' };

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchMembers(); }, [page, search]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', { params: { page, limit: 8, search } });
      setMembers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditMember(null);
    setForm(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditMember(member);
    setForm({
      name: member.name, nim: member.nim, email: member.email,
      phone: member.phone || '', faculty: member.faculty || '', program: member.program || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editMember) {
        await api.put(`/members/${editMember._id}`, form);
      } else {
        await api.post('/members', form);
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus anggota');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>👥 Data Anggota</h1>
        <p>Kelola data anggota perpustakaan UNSIA</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Cari nama, NIM, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Tambah Anggota</button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading">⏳ Memuat data...</div>
          ) : members.length === 0 ? (
            <div className="loading">📭 Tidak ada data anggota</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NIM</th>
                  <th>Email</th>
                  <th>No. HP</th>
                  <th>Program Studi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td><strong>{m.name}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>{m.nim}</td>
                    <td>{m.email}</td>
                    <td>{m.phone || '-'}</td>
                    <td>{m.program || '-'}</td>
                    <td>
                      <span className={`badge ${m.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {m.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>🗑️</button>
                      </div>
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
              <h3>{editMember ? '✏️ Edit Anggota' : '➕ Tambah Anggota'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Lengkap *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>NIM *</label>
                  <input className="form-control" value={form.nim} onChange={e => setForm({...form, nim: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>No. HP</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fakultas</label>
                  <input className="form-control" value={form.faculty} onChange={e => setForm({...form, faculty: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Program Studi</label>
                <input className="form-control" value={form.program} onChange={e => setForm({...form, program: e.target.value})} />
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

export default Members;
