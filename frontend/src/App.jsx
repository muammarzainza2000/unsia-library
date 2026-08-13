import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - tidak perlu login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - harus login dulu */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/books" element={
            <ProtectedRoute><Books /></ProtectedRoute>
          } />
          <Route path="/members" element={
            <ProtectedRoute><Members /></ProtectedRoute>
          } />
          <Route path="/loans" element={
            <ProtectedRoute><Loans /></ProtectedRoute>
          } />

          {/* Redirect root ke dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - semua route yang tidak dikenali */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
