import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaHome } from 'react-icons/fa';

const Forbidden = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4 text-center">
      <div className="dashboard-card p-5" style={{ maxWidth: '480px' }}>
        <div className="card-icon-wrapper card-icon-red mx-auto mb-3" style={{ width: '70px', height: '70px', fontSize: '2.2rem' }}>
          <FaLock />
        </div>
        <h1 className="display-4 fw-bold text-dark mb-2">403</h1>
        <h4 className="fw-semibold text-danger mb-3">Access Denied</h4>
        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          You do not have the required administrative role permissions to access this page.
        </p>
        <Link to="/dashboard" className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-4 py-2 rounded-md">
          <FaHome /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
