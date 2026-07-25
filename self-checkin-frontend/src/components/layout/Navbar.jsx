import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaBars, FaBell, FaSignOutAlt, FaKey, FaSearch } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import eventsyncIcon from '../../assets/eventsync_icon.svg';
import Swal from 'sweetalert2';

const Navbar = ({ toggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to log out of your EventSync session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#212227',
      cancelButtonColor: '#6E7079',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const isAdmin = role === 'ADMIN';

  const navPills = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Events', path: '/events' },
    { label: 'Participants', path: '/participants' },
    { label: 'Scanner', path: '/scanner' },
    { label: 'Certificates', path: '/certificates' },
    { label: 'Reports', path: '/reports' },
    ...(isAdmin ? [{ label: 'Settings', path: '/settings' }] : [])
  ];

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button className="toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
          <FaBars />
        </button>

        {/* EventSync Logo beside application name in Navbar */}
        <Link to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none me-2">
          <img src={eventsyncIcon} alt="EventSync Logo" style={{ width: '28px', height: '28px' }} />
          <span className="fw-extrabold d-none d-sm-inline" style={{ fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#212227' }}>Event</span>
            <span style={{ color: '#E5AB00' }}>Sync</span>
          </span>
        </Link>

        {/* Center Pill Nav Bar */}
        <div className="nav-pill-group d-none d-lg-flex">
          {navPills.map((pill) => {
            const isActive = location.pathname === pill.path;
            return (
              <Link
                key={pill.path}
                to={pill.path}
                className={`nav-pill-item ${isActive ? 'active' : ''}`}
              >
                {pill.label}
              </Link>
            );
          })}
        </div>

        {/* Quick Search bar for medium screens */}
        <div className="d-none d-md-flex d-lg-none align-items-center position-relative" style={{ width: '180px' }}>
          <FaSearch className="position-absolute ms-3 text-muted" style={{ fontSize: '0.85rem' }} />
          <input
            type="text"
            className="form-control ps-5 rounded-pill border-0 bg-white shadow-sm"
            placeholder="Search..."
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Notification Bell Badge */}
        <div className="position-relative cursor-pointer p-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          <FaBell className="text-dark" style={{ fontSize: '1.1rem' }} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: '#212227', color: '#FFD036', fontSize: '0.65rem' }}>
            2
          </span>
        </div>

        <div className="vr d-none d-sm-block" style={{ height: '24px', opacity: 0.2 }}></div>

        {/* Profile Dropdown Menu */}
        <div className="dropdown">
          <button
            className="btn p-0 border-0 d-flex align-items-center gap-2 text-start"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="user-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : 'A')}
            </div>
            <div className="d-none d-sm-block">
              <div className="fw-bold text-dark leading-tight" style={{ fontSize: '0.88rem' }}>
                {user?.fullName || user?.username || 'Administrator'}
              </div>
              <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <span className="badge rounded-pill" style={{ background: '#FFD036', color: '#1C1D21', fontSize: '0.65rem', fontWeight: 700 }}>
                  {role || 'ADMIN'}
                </span>
              </div>
            </div>
          </button>

          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-2" style={{ borderRadius: '18px', minWidth: '220px', background: '#FFFFFF' }}>
            <li className="px-3 py-2 border-bottom mb-2">
              <div className="fw-bold text-dark">{user?.fullName || user?.username || 'Administrator'}</div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.78rem' }}>{user?.email || 'admin@eventsync.com'}</div>
            </li>
            <li>
              <Link className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2" to="/change-password">
                <FaKey style={{ color: '#212227' }} /> Change Password
              </Link>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 text-danger fw-bold" onClick={handleLogout}>
                <FaSignOutAlt /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
