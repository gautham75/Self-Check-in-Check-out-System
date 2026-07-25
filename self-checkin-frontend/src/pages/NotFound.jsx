import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 text-center">
      <div className="dashboard-card p-5" style={{ maxWidth: '480px' }}>
        <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '4rem' }} />
        <h1 className="display-4 fw-bold text-dark mb-2">404</h1>
        <h4 className="fw-semibold text-secondary mb-3">Page Not Found</h4>
        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-4 py-2 rounded-md">
          <FaHome /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
