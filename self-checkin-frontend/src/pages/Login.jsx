import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import eventsyncIcon from '../assets/eventsync_icon.svg';
import { FaLock, FaUser, FaUserShield, FaUserTie } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userObj = await login(username, password);
      Swal.fire({
        icon: 'success',
        title: `Welcome, ${userObj.fullName || userObj.username}!`,
        text: `Signed in as ${userObj.role}.`,
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'var(--bg-ambient)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className="card border-0 shadow-lg p-4 p-md-5"
        style={{
          maxWidth: '450px',
          width: '100%',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(225, 200, 140, 0.12)'
        }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center mb-3">
            <img src={eventsyncIcon} alt="EventSync Logo" style={{ width: '64px', height: '64px' }} />
          </div>
          <h2 className="fw-extrabold mb-1" style={{ letterSpacing: '-0.03em' }}>
            <span style={{ color: '#212227' }}>Event</span>
            <span style={{ color: '#E5AB00' }}>Sync</span>
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem', fontWeight: 500 }}>
            Enterprise Digital Check-In & Attendance Platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
              Username or Email
            </label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: '#F5F3ED' }}>
                <FaUser className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                style={{ background: '#F5F3ED', fontSize: '0.9rem' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text border-end-0" style={{ background: '#F5F3ED' }}>
                <FaLock className="text-muted" />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                style={{ background: '#F5F3ED', fontSize: '0.9rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-crextio-dark w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Sign In to EventSync'
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top">
          <div className="text-muted fw-bold mb-2 text-center" style={{ fontSize: '0.8rem' }}>
            Quick Credentials fill:
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-dark w-50 rounded-pill fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleQuickFill('admin', 'admin123')}
            >
              <FaUserShield style={{ color: '#FFD036' }} /> Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary w-50 rounded-pill fw-bold py-2 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleQuickFill('staff', 'staff123')}
            >
              <FaUserTie /> Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
