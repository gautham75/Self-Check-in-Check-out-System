import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import eventsyncIcon from '../../assets/eventsync_icon.svg';
import {
  FaThLarge,
  FaCalendarAlt,
  FaUsers,
  FaQrcode,
  FaAward,
  FaChartBar,
  FaCog
} from 'react-icons/fa';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const { role } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaThLarge />, roles: ['ADMIN', 'STAFF'] },
    { path: '/events', label: 'Events', icon: <FaCalendarAlt />, roles: ['ADMIN', 'STAFF'] },
    { path: '/participants', label: 'Participants', icon: <FaUsers />, roles: ['ADMIN', 'STAFF'] },
    { path: '/scanner', label: 'QR Scanner', icon: <FaQrcode />, roles: ['ADMIN', 'STAFF'] },
    { path: '/certificates', label: 'Certificates', icon: <FaAward />, roles: ['ADMIN', 'STAFF'] },
    { path: '/reports', label: 'Reports & Analytics', icon: <FaChartBar />, roles: ['ADMIN', 'STAFF'] },
    { path: '/settings', label: 'Settings', icon: <FaCog />, roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter((item) => !role || item.roles.includes(role));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ height: collapsed ? '76px' : '90px', padding: collapsed ? '0 1.25rem' : '1rem 1.25rem' }}>
        <NavLink to="/dashboard" className="sidebar-logo text-decoration-none">
          <div className="sidebar-logo-icon">
            <img src={eventsyncIcon} alt="EventSync Logo" style={{ width: '38px', height: '38px' }} />
          </div>
          {!collapsed && (
            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
                <span style={{ color: '#212227' }}>Event</span>
                <span style={{ color: '#E5AB00' }}>Sync</span>
              </span>
              <span className="text-muted text-truncate" style={{ fontSize: '0.68rem', fontWeight: 500, lineHeight: '1.3', marginTop: '2px', whiteSpace: 'normal', maxWidth: '170px' }}>
                Smart Event Check-In &amp; Attendance Management
              </span>
            </div>
          )}
        </NavLink>
      </div>

      <ul className="sidebar-menu">
        {visibleItems.map((item) => (
          <li key={item.path} className="sidebar-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
