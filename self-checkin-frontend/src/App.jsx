import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';

// Lazy loading route modules for performance optimization
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const Participants = lazy(() => import('./pages/Participants'));
const QRScanner = lazy(() => import('./pages/QRScanner'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Forbidden = lazy(() => import('./pages/Forbidden'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fallback Spinner matching Crextio Design System
const PageLoadingFallback = () => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
    <div className="spinner-border mb-3" style={{ width: '2.5rem', height: '2.5rem', color: '#FFD036' }} role="status">
      <span className="visually-hidden">Loading page...</span>
    </div>
    <div className="fw-bold text-muted" style={{ fontSize: '0.9rem' }}>
      Loading module...
    </div>
  </div>
);

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="app-wrapper">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1035,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      <div className={`main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="content-body">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Standalone Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/scanner" element={<QRScanner />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Admin Only Route */}
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-All Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
