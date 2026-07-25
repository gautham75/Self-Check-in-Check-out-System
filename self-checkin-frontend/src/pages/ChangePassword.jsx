import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { FaKey, FaLock, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire('Password Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Password Changed!',
        text: 'Your account password has been updated.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Account Security</h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Update your user account password
        </p>
      </div>

      <div className="row">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="dashboard-card">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaKey className="text-primary" /> Change Password
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                  Current Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FaLock className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FaKey className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FaKey className="text-muted" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary fw-semibold w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <FaSave /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
