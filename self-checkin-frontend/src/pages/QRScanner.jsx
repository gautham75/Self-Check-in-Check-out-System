import React, { useState } from 'react';
import scannerService from '../services/scannerService';
import participantService from '../services/participantService';
import { notifyDataChanged } from '../utils/dataSyncUtil';
import { formatDateTime, formatDuration } from '../utils/formatters';
import {
  FaQrcode,
  FaCamera,
  FaCheckCircle,
  FaUserCheck,
  FaUserTimes,
  FaExclamationCircle,
  FaGraduationCap,
  FaBuilding,
  FaBarcode
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const QRScanner = () => {
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanParticipant, setLastScanParticipant] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = qrCodeInput.trim();
    if (!query) {
      Swal.fire('Input Required', 'Please enter a participant ID, QR code payload, or registration number.', 'info');
      return;
    }

    setScanning(true);
    try {
      // Process QR scan via scanner API (handles ID, Reg No, Email, or QR payload)
      const pResult = await scannerService.scanQRCode(query);

      setLastScanParticipant(pResult);
      setScanHistory((prev) => [
        { ...pResult, scanTimestamp: new Date().toISOString() },
        ...prev.slice(0, 4)
      ]);

      const name = pResult.fullName || pResult.name || 'Participant';
      Swal.fire({
        icon: 'success',
        title: 'Check-In Successful!',
        html: `Participant <strong>${name}</strong> has been checked in cleanly.`,
        timer: 2000,
        showConfirmButton: false
      });

      setQrCodeInput('');
      notifyDataChanged();
    } catch (err) {
      console.error('QR Scan error:', err);
      const msg = err.response?.data?.message || err.message || 'Could not process QR Code or Participant ID.';

      if (msg.includes('EXPIRED_QR_PASS') || msg.includes('expired')) {
        Swal.fire({
          icon: 'warning',
          title: '🛑 EXPIRED QR PASS (SCREENSHOT DETECTED)',
          html: `<div style="font-size:0.95rem; color:#991B1B;">
            <strong>Anti-Proxy Security Notice:</strong><br/>
            This QR code pass has expired. Screenshots and forwarded images are automatically rejected to prevent proxy check-in.<br/><br/>
            <span className="text-muted">Please instruct the attendee to open their <strong>Live Mobile Pass</strong> on their phone screen.</span>
          </div>`,
          confirmButtonColor: '#DC2626'
        });
      } else if (msg.includes('INVALID_QR_PASS')) {
        Swal.fire({
          icon: 'error',
          title: 'INVALID / TAMPERED SECURITY PASS',
          text: 'The scanned security token is invalid or corrupted.',
          confirmButtonColor: '#DC2626'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Scan Processing Failed',
          text: msg,
          confirmButtonColor: '#2563eb'
        });
      }
    } finally {
      setScanning(false);
    }
  };

  const handleManualCheckOut = async (id, name) => {
    try {
      const updated = await participantService.checkOut(id);
      setLastScanParticipant(updated);
      Swal.fire({
        icon: 'info',
        title: 'Checked Out',
        text: `${name || 'Participant'} has checked out successfully.`,
        timer: 1800,
        showConfirmButton: false
      });
      notifyDataChanged();
    } catch (err) {
      console.error('Check-out error:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
          QR Code Scanner Terminal
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Process attendee tickets, verify registration status, and execute real-time check-ins
        </p>
      </div>

      <div className="row g-4">
        {/* Terminal Input Card */}
        <div className="col-12 col-lg-6">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <FaBarcode className="text-primary" /> Scan / Enter QR Payload
              </h5>
              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 font-monospace">
                TERMINAL ONLINE
              </span>
            </div>

            <form onSubmit={handleScanSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                  Scan Barcode or Enter Participant ID / Reg No.
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaQrcode className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg border-start-0 ps-0"
                    placeholder="e.g. 1 or REG-1001 or scan QR payload..."
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="form-text text-muted" style={{ fontSize: '0.78rem' }}>
                  Tip: Connect your hardware USB barcode scanner or type participant ID and press Enter.
                </div>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-md fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Scan...</span>
                    </>
                  ) : (
                    <>
                      <FaCamera /> <span>Execute Check-In Scan</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-top">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>Quick Instructions:</h6>
              <ul className="text-muted ps-3 mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                <li>Point your 2D camera scanner at the attendee ticket or mobile screen.</li>
                <li>System automatically verifies participant event assignment &amp; timestamps entry.</li>
                <li>Duplicate scans will prompt automatic check-out option.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scan Result Card */}
        <div className="col-12 col-lg-6">
          <div className="dashboard-card h-100">
            <h5 className="fw-bold mb-3 text-dark border-bottom pb-3 d-flex align-items-center gap-2">
              <FaCheckCircle className="text-success" /> Live Verification Output
            </h5>

            {lastScanParticipant ? (
              <div>
                <div className="p-3.5 rounded-3 mb-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary rounded-pill px-2.5 py-1">
                      {lastScanParticipant.registrationNumber || `REG-${lastScanParticipant.id}`}
                    </span>
                    {lastScanParticipant.checkedOut ? (
                      <span className="badge bg-danger rounded-pill">Checked Out</span>
                    ) : lastScanParticipant.checkedIn ? (
                      <span className="badge bg-success rounded-pill">Checked In</span>
                    ) : (
                      <span className="badge bg-secondary rounded-pill">Registered</span>
                    )}
                  </div>

                  <h4 className="fw-bold text-dark mb-1">
                    {lastScanParticipant.fullName || lastScanParticipant.name}
                  </h4>
                  <div className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                    {lastScanParticipant.email} • {lastScanParticipant.phone}
                  </div>

                  <div className="row g-2 mb-3" style={{ fontSize: '0.825rem' }}>
                    <div className="col-6">
                      <div className="text-muted">Department:</div>
                      <div className="fw-bold text-dark d-flex align-items-center gap-1">
                        <FaGraduationCap className="text-primary" />
                        {lastScanParticipant.department || 'N/A'} ({lastScanParticipant.year || 'N/A'})
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted">Institution:</div>
                      <div className="fw-bold text-dark d-flex align-items-center gap-1">
                        <FaBuilding />
                        {lastScanParticipant.college || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-white border" style={{ fontSize: '0.8rem' }}>
                    <div className="d-flex justify-content-between text-muted mb-1">
                      <span>Check-In Timestamp:</span>
                      <strong className="text-dark">{formatDateTime(lastScanParticipant.checkInTime)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted mb-1">
                      <span>Check-Out Timestamp:</span>
                      <strong className="text-dark">{formatDateTime(lastScanParticipant.checkOutTime)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-muted">
                      <span>Total Duration:</span>
                      <strong className="text-primary">
                        {lastScanParticipant.durationMinutes ? formatDuration(lastScanParticipant.durationMinutes) : 'Active Inside'}
                      </strong>
                    </div>
                  </div>
                </div>

                {lastScanParticipant.checkedIn && !lastScanParticipant.checkedOut && (
                  <button
                    className="btn btn-warning w-100 rounded-md fw-semibold d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleManualCheckOut(lastScanParticipant.id, lastScanParticipant.fullName || lastScanParticipant.name)}
                  >
                    <FaUserTimes /> Process Check-Out For Attendee
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <FaExclamationCircle style={{ fontSize: '2.5rem' }} className="mb-2 text-secondary opacity-30" />
                <h6 className="fw-bold mb-1">Awaiting Scanner Input</h6>
                <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                  Scan a QR code ticket to display participant credentials and verify check-in status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scan History */}
      {scanHistory.length > 0 && (
        <div className="dashboard-card mt-4">
          <h6 className="fw-bold text-dark mb-3">Terminal Session Recent Scans</h6>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Reg No.</th>
                  <th>Attendee Name</th>
                  <th>Event</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((sh, i) => (
                  <tr key={i}>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {formatDateTime(sh.scanTimestamp)}
                    </td>
                    <td className="fw-bold text-secondary">{sh.registrationNumber || `REG-${sh.id}`}</td>
                    <td className="fw-bold text-dark">{sh.fullName || sh.name}</td>
                    <td className="fw-semibold text-primary">{sh.event?.eventName || sh.eventName || 'Main Event'}</td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded">
                        <FaUserCheck className="me-1" /> Checked In
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
