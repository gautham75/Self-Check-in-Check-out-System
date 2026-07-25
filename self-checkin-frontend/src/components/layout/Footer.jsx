import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
      <div>
        © {new Date().getFullYear()} <span className="fw-bold" style={{ color: '#212227' }}>Event</span><span className="fw-bold" style={{ color: '#E5AB00' }}>Sync</span> Platform. All rights reserved.
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
          Backend API: Online
        </span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
