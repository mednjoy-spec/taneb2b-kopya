import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomerPanel from './components/CustomerPanel';
import SupplierPanel from './components/SupplierPanel';
import { UserProvider, useUser } from './contexts/UserContext';
import './index.css';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.profile?.role;
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function UnauthorizedPage() {
  const { user, logout } = useUser();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Yetkisiz Erişim</h2>
        <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        <p className="text-sm text-gray-500 mb-4">Kullanıcı rolü: {user?.profile?.role}</p>
        <button 
          onClick={logout}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

function LoginRoute() {
  const { user } = useUser();
  
  if (user?.profile?.role) {
    // Redirect based on role
    if (user.profile.role === 'admin' || user.profile.role === 'manager') {
      return <Navigate to="/admin" replace />;
    } else if (user.profile.role === 'supplier') {
      return <Navigate to="/supplier" replace />;
    } else if (user.profile.role === 'customer') {
      return <Navigate to="/customer" replace />;
    }
  }
  
  return <Login />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/supplier" 
        element={
          <ProtectedRoute allowedRoles={['supplier']}>
            <SupplierPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/customer" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;