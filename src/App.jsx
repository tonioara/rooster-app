import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RegisterRestaurant from './pages/RegisterRestaurant';

function ProtectedRoute({ children, requireAdmin }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (requireAdmin) {
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (!isAdmin) return <Navigate to="/employee-dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRestaurant />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/employee-dashboard" element={
            <ProtectedRoute><EmployeeDashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
