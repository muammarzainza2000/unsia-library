import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/books', icon: '📚', label: 'Data Buku' },
    { to: '/members', icon: '👥', label: 'Data Anggota' },
    { to: '/loans', icon: '📋', label: 'Peminjaman' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>📖 UNSIA</h2>
        <span>Digital Library</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>
          👤 {user?.name}
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
