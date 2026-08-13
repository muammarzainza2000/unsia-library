import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div className="not-found">
        <div h1 style={{ fontSize: 80, fontWeight: 800, color: '#2563eb' }}>404</div>
        <h2>Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
        <Link to="/dashboard" className="btn btn-primary">
          🏠 Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
