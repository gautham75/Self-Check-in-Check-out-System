import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { resolveApiUrl, formatDateTime, formatDuration } from '../utils/formatters';
import {
  FaQrcode,
  FaCamera,
  FaCheckCircle,
  FaUserCheck,
  FaUserTimes,
  FaExclamationCircle,
  FaGraduationCap,
  FaBuilding,
  FaBarcode,
  FaCertificate,
  FaShieldAlt,
  FaStopCircle
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const QRScanner = () => {
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScanParticipant, setLastScanParticipant] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrcodeScanner = null;
    if (cameraActive) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(
        async (decodedText) => {
          if (decodedText) {
            setCameraActive(false);
            try {
              if (html5QrcodeScanner) html5QrcodeScanner.clear();
            } catch (_) {}
            setQrCodeInput(decodedText);
            executeProcessQuery(decodedText);
          }
        },
        (error) => {
          // ignore scan errors
        }
      );
    }

    return () => {
      if (html5QrcodeScanner) {
        try {
          html5QrcodeScanner.clear();
        } catch (_) {}
      }
    };
  }, [cameraActive]);

  const executeProcessQuery = async (queryStr) => {
    const query = (queryStr || qrCodeInput).trim();
    if (!query) {
      Swal.fire('Input Required', 'Please enter a participant ID, QR code payload, or registration number.', 'info');
      return;
    }

    setScanning(true);
    try {
      // 1. Resolve participant details first
      let targetId = null;
      if (!isNaN(query)) {
        targetId = Number(query);
      } else {
        try {
          const parsed = JSON.parse(query);
          if (parsed && parsed.id) targetId = parsed.id;
        } catch (_) {}
      }

      if (!targetId) {
        // Fallback search by registration number / name / email
        const searchRes = await api.get('/participants/search', { params: { registrationNumber: query } });
        if (searchRes.data && searchRes.data.length > 0) {
          targetId = searchRes.data[0].id;
        }
      }

      if (!targetId) {
        Swal.fire('Participant Not Found', 'Could not find participant matching: ' + query, 'error');
        setScanning(false);
        return;
      }

      // 2. Dispatch 6-digit Check-In OTP to participant's email
      const otpRes = await api.post(`/participants/send-checkin-otp/${targetId}`);
      const attendeeName = otpRes.data.fullName || 'Attendee';
      const attendeeEmail = otpRes.data.email || 'attendee email';

      // 3. Prompt Staff for 6-Digit OTP received on attendee phone
      const { value: otpCode } = await Swal.fire({
        title: '🔐 Attendee Identity OTP Verification',
        html: `A 6-digit Check-In OTP has been dispatched to <strong>${attendeeEmail}</strong>.<br/><br/>
               Ask <strong>${attendeeName}</strong> for their 6-digit PIN to complete entry:`,
        input: 'text',
        inputPlaceholder: 'Enter 6-digit OTP (e.g. 482910)',
        inputAttributes: {
          maxLength: 6,
          style: 'text-align: center; font-size: 1.5rem; letter-spacing: 4px; font-family: monospace;'
        },
        showCancelButton: true,
        confirmButtonText: 'Verify & Issue Certificate',
        confirmButtonColor: '#212227',
        cancelButtonColor: '#6B7280',
        allowOutsideClick: false,
        inputValidator: (val) => {
          if (!val || val.trim().length !== 6) {
            return 'Please enter a valid 6-digit OTP PIN.';
          }
        }
      });

      if (!otpCode) {
        setScanning(false);
        return;
      }

      // 4. Verify Check-In with OTP & Generate Certificate
      const verifyRes = await api.post('/participants/checkin-with-otp', {
        participantId: targetId,
        otpCode: otpCode.trim()
      });

      const pResult = verifyRes.data.participant || verifyRes.data;

      setLastScanParticipant(pResult);
      setScanHistory((prev) => [
        { ...pResult, scanTimestamp: new Date().toISOString() },
        ...prev.slice(0, 4)
      ]);

      const certLink = verifyRes.data.certificateUrl || pResult.certificateUrl;

      Swal.fire({
        icon: 'success',
        title: 'Check-In Verified!',
        html: `Participant <strong>${pResult.fullName || attendeeName}</strong> has been checked in.<br/>
               ${certLink ? `<a href="${resolveApiUrl(certLink)}" target="_blank" class="btn btn-sm btn-success mt-2">📜 View Certificate PDF</a>` : ''}`,
        confirmButtonColor: '#212227'
      });

      setQrCodeInput('');
    } catch (err) {
      console.error('QR Scan / OTP error:', err);
      const msg = err.response?.data?.message || err.message || 'Could not process Check-In OTP.';
      Swal.fire({
        icon: 'error',
        title: 'Check-In Failed',
        text: msg,
        confirmButtonColor: '#DC2626'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleScanSubmit = (e) => {
    if (e) e.preventDefault();
    executeProcessQuery(qrCodeInput);
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

            {/* Live Web Camera Viewport */}
            {cameraActive && (
              <div className="mb-4 p-3 bg-light rounded border text-center">
                <div id="qr-reader-container" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2 fw-semibold d-inline-flex align-items-center gap-1"
                  onClick={() => setCameraActive(false)}
                >
                  <FaStopCircle /> Stop Camera Feed
                </button>
              </div>
            )}

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
                {!cameraActive && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-md rounded-md fw-bold mb-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setCameraActive(true)}
                  >
                    <FaCamera /> <span>Open Live Camera Scanner</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-md fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Processing Scan &amp; OTP...</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt /> <span>Execute Check-In &amp; Send OTP</span>
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
