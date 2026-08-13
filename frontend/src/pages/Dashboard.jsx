import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout';
import api from '../utils/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data.data);
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">⏳ Memuat dashboard...</div></Layout>;
  if (error) return <Layout><div className="alert alert-danger">{error}</div></Layout>;

  const { summary: s, charts } = summary;

  const categoryChartData = {
    labels: charts.booksByCategory.map((c) => c._id),
    datasets: [{
      data: charts.booksByCategory.map((c) => c.count),
      backgroundColor: [
        '#2563eb', '#16a34a', '#d97706', '#dc2626',
        '#7c3aed', '#0891b2', '#db2777', '#65a30d',
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const loanChartData = {
    labels: charts.loansByMonth.map((l) => `${monthNames[l._id.month - 1]} ${l._id.year}`),
    datasets: [{
      label: 'Jumlah Peminjaman',
      data: charts.loansByMonth.map((l) => l.count),
      backgroundColor: '#2563eb',
      borderRadius: 6,
    }],
  };

  const summaryCards = [
    { label: 'Total Buku', value: s.totalBooks, icon: '📚', color: '#2563eb' },
    { label: 'Total Anggota', value: s.totalMembers, icon: '👥', color: '#16a34a' },
    { label: 'Total Peminjaman', value: s.totalLoans, icon: '📋', color: '#d97706' },
    { label: 'Sedang Dipinjam', value: s.activeLoans, icon: '🔖', color: '#dc2626' },
    { label: 'Sudah Kembali', value: s.returnedLoans, icon: '✅', color: '#7c3aed' },
    { label: 'Stok Tersedia', value: s.totalAvailableStock, icon: '📦', color: '#0891b2' },
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Ringkasan kondisi perpustakaan UNSIA Digital Library</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map((card) => (
          <div className="summary-card" key={card.label}>
            <div className="icon">{card.icon}</div>
            <div className="label">{card.label}</div>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
            📊 Buku per Kategori
          </h3>
          {charts.booksByCategory.length > 0 ? (
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
              }}
            />
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Belum ada data buku
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
            📈 Peminjaman per Bulan
          </h3>
          {charts.loansByMonth.length > 0 ? (
            <Bar
              data={loanChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Belum ada data peminjaman
            </p>
          )}
        </div>
      </div>

      {/* Status Peminjaman */}
      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
          📋 Ringkasan Status Peminjaman
        </h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Sedang Dipinjam</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{s.activeLoans}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Sudah Dikembalikan</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{s.returnedLoans}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Total Transaksi</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{s.totalLoans}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
