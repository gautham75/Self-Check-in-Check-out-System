import React, { useEffect, useState, useCallback } from 'react';
import participantService from '../services/participantService';
import eventService from '../services/eventService';
import { notifyDataChanged, useDataSyncListener } from '../utils/dataSyncUtil';
import { formatDateTime, formatDuration, resolveApiUrl } from '../utils/formatters';
import api from '../services/api';
import {
  FaUserPlus,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaQrcode,
  FaTrash,
  FaEdit,
  FaSync,
  FaSave,
  FaBuilding,
  FaGraduationCap,
  FaShieldAlt,
  FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const initialForm = {
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '1st Year',
    registrationNumber: '',
    eventId: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [pData, eData] = await Promise.all([
        participantService.getAllParticipants().catch(() => []),
        eventService.getAllEvents().catch(() => [])
      ]);
      setParticipants(Array.isArray(pData) ? pData : []);
      setEvents(Array.isArray(eData) ? eData : []);
    } catch (err) {
      console.error('Error loading directory data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Subscribe to global data synchronization events
  useDataSyncListener(fetchInitialData);

  const handleRefresh = () => {
    fetchInitialData();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Participants Directory Refreshed',
      showConfirmButton: false,
      timer: 1200
    });
  };

  // OTP Resend Countdown Effect
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      Swal.fire('Valid Email Required', 'Please enter a valid email address first.', 'warning');
      return;
    }
    setOtpSending(true);
    try {
      await api.post('/otp/send', {
        email: formData.email,
        name: formData.fullName || 'Registrant'
      });
      setOtpSent(true);
      setOtpCountdown(60);
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `A 6-digit verification OTP code has been emailed to ${formData.email}.`,
        timer: 3000
      });
    } catch (err) {
      console.error('Failed to send OTP:', err);
      Swal.fire('OTP Dispatch Failed', err.response?.data?.message || 'Could not dispatch OTP email.', 'error');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCodeInput || otpCodeInput.trim().length !== 6) {
      Swal.fire('6-Digit OTP Required', 'Please enter the 6-digit verification code received in your email.', 'warning');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await api.post('/otp/verify', {
        email: formData.email,
        code: otpCodeInput.trim()
      });
      if (res.data.verified) {
        setOtpVerified(true);
        Swal.fire('Email Verified!', 'Your email identity has been verified successfully.', 'success');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      Swal.fire('Verification Failed', err.response?.data?.message || 'Invalid or expired OTP code.', 'error');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      ...initialForm,
      eventId: events.length > 0 ? events[0].id : '',
      registrationNumber: `REG-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (p) => {
    setIsEditing(true);
    setSelectedId(p.id);
    setFormData({
      fullName: p.fullName || p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      college: p.college || '',
      department: p.department || '',
      year: p.year || '1st Year',
      registrationNumber: p.registrationNumber || '',
      eventId: p.event?.id || (events.length > 0 ? events[0].id : ''),
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      eventId: Number(formData.eventId)
    };

    try {
      if (isEditing) {
        await participantService.updateParticipant(selectedId, payload);
        Swal.fire({
          icon: 'success',
          title: 'Participant Updated!',
          text: 'Participant details saved successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await participantService.createParticipant(payload);
        Swal.fire({
          icon: 'success',
          title: 'Participant Registered!',
          text: 'QR code generated and saved to AWS S3.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      // Notify global listeners & refresh local state
      notifyDataChanged();
      fetchInitialData();
    } catch (err) {
      console.error('Submit participant error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Delete Participant?',
      html: `Are you sure you want to remove <strong>${name || 'this participant'}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await participantService.deleteParticipant(id);
          Swal.fire({ icon: 'success', title: 'Deleted', text: 'Participant removed.', timer: 1500, showConfirmButton: false });
          notifyDataChanged();
          fetchInitialData();
        } catch (err) {
          console.error('Delete participant failed:', err);
        }
      }
    });
  };

  const promptCheckInOtp = async (participantId, participantName) => {
    let currentOtpRes = await api.post(`/participants/send-checkin-otp/${participantId}`);

    while (true) {
      const attendeeEmail = currentOtpRes.data.email || 'attendee email';
      const debugCode = currentOtpRes.data.debugOtpCode;

      const result = await Swal.fire({
        title: '🔐 Check-In Identity OTP',
        html: `A 6-digit Check-In OTP code has been emailed to <strong>${attendeeEmail}</strong>.<br/>
               ${debugCode ? `<div class="mt-2 p-2 bg-warning bg-opacity-10 rounded text-dark font-monospace" style="font-size:0.8rem; border: 1px dashed #D97706;">Current OTP PIN: <strong>${debugCode}</strong></div>` : ''}<br/>
               Enter the 6-digit PIN to complete entry for <strong>${participantName || 'Participant'}</strong>:`,
        input: 'text',
        inputPlaceholder: 'Enter 6-digit OTP (e.g. 482910)',
        inputAttributes: {
          maxLength: 6,
          style: 'text-align: center; font-size: 1.5rem; letter-spacing: 4px; font-family: monospace;'
        },
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Verify & Issue Certificate',
        denyButtonText: '🔄 Resend New OTP',
        confirmButtonColor: '#212227',
        denyButtonColor: '#D97706',
        cancelButtonColor: '#6B7280',
        allowOutsideClick: false,
        inputValidator: (val) => {
          if (!val || val.trim().length !== 6) {
            return 'Please enter a valid 6-digit OTP PIN.';
          }
        }
      });

      if (result.isDenied) {
        // Staff clicked "Resend New OTP" -> generate a DIFFERENT fresh OTP code
        Swal.fire({
          title: 'Dispatching Fresh OTP...',
          text: 'Generating a brand new 6-digit code and emailing attendee...',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          showConfirmButton: false
        });

        try {
          currentOtpRes = await api.post(`/participants/send-checkin-otp/${participantId}`);
          await Swal.fire({
            icon: 'success',
            title: 'New OTP Dispatched!',
            text: `A fresh 6-digit code has been sent to ${attendeeEmail}`,
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Resend Failed',
            text: 'Could not generate new OTP code.',
            timer: 2000,
            showConfirmButton: false
          });
        }
        continue;
      }

      if (result.isConfirmed && result.value) {
        return result.value.trim();
      }

      return null;
    }
  };

  const handleCheckIn = async (id, name) => {
    try {
      const otpCode = await promptCheckInOtp(id, name);
      if (!otpCode) return;

      // Verify OTP & Issue Certificate
      const verifyRes = await api.post('/participants/checkin-with-otp', {
        participantId: id,
        otpCode: otpCode
      });

      const certLink = verifyRes.data.certificateUrl;

      Swal.fire({
        icon: 'success',
        title: 'Check-In Verified!',
        html: `Participant <strong>${name || 'Participant'}</strong> checked in successfully.<br/>
               ${certLink ? `<a href="${resolveApiUrl(certLink)}" target="_blank" class="btn btn-sm btn-success mt-2">📜 View Certificate PDF</a>` : ''}`,
        confirmButtonColor: '#212227'
      });

      notifyDataChanged();
      fetchInitialData();
    } catch (err) {
      console.error('Check-in OTP error:', err);
      const msg = err.response?.data?.message || err.message || 'Could not verify Check-In OTP.';
      Swal.fire('Check-In Failed', msg, 'error');
    }
  };

  const handleCheckOut = async (id, name) => {
    try {
      await participantService.checkOut(id);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Checked Out: ${name}`,
        showConfirmButton: false,
        timer: 1500
      });
      notifyDataChanged();
      fetchInitialData();
    } catch (err) {
      console.error('Check-out error:', err);
    }
  };

  const handleViewQRCode = (qrUrl, name) => {
    if (!qrUrl) {
      Swal.fire('No QR Code', 'QR Code not yet uploaded for this participant.', 'info');
      return;
    }
    Swal.fire({
      title: `QR Code: ${name}`,
      imageUrl: resolveApiUrl(qrUrl),
      imageWidth: 220,
      imageHeight: 220,
      imageAlt: 'Participant QR Code',
      confirmButtonText: 'Close',
      confirmButtonColor: '#2563eb'
    });
  };

  const filtered = participants.filter((p) => {
    const pName = p.fullName || p.name || '';
    const regNo = p.registrationNumber || '';
    const pEmail = p.email || '';
    return (
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            Participants Directory
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Register participants, manage check-in/out statuses, and inspect QR credentials
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-md"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? 'spin' : ''} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 rounded-md fw-semibold shadow-sm"
            onClick={handleOpenCreateModal}
          >
            <FaUserPlus />
            <span>Register Participant</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="dashboard-card mb-4">
        <div className="row g-3 align-items-center mb-4">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="position-relative">
              <FaSearch className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
              <input
                type="text"
                className="form-control ps-5 rounded-md"
                placeholder="Search by name, reg number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-7 text-md-end text-muted" style={{ fontSize: '0.875rem' }}>
            Total Attendees: <strong>{filtered.length}</strong> of <strong>{participants.length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading participants...</span>
            </div>
            <p className="mt-2 text-muted mb-0" style={{ fontSize: '0.9rem' }}>Fetching attendees directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-2 fw-semibold">No participants found.</p>
            <button className="btn btn-primary btn-sm rounded-md" onClick={handleOpenCreateModal}>
              <FaUserPlus className="me-1" /> Register First Participant
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reg No.</th>
                  <th>Participant</th>
                  <th>Department &amp; College</th>
                  <th>Event Name</th>
                  <th>QR Code</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pName = p.fullName || p.name || 'Attendee';
                  const isCheckedIn = p.checkedIn || p.checkInTime != null;
                  const isCheckedOut = p.checkedOut || p.checkOutTime != null;

                  return (
                    <tr key={p.id}>
                      <td className="fw-bold text-secondary" style={{ fontSize: '0.85rem' }}>
                        {p.registrationNumber || `REG-${p.id}`}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.9rem' }}>
                            {pName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{pName}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                            <FaGraduationCap className="text-primary" /> {p.department || 'General'} ({p.year || 'N/A'})
                          </div>
                          <div className="text-muted d-flex align-items-center gap-1">
                            <FaBuilding /> {p.college || 'Institution'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-primary" style={{ fontSize: '0.85rem' }}>
                          {p.event?.eventName || p.eventName || 'Main Event'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1 rounded-md py-1 px-2"
                          style={{ fontSize: '0.8rem' }}
                          onClick={() => handleViewQRCode(p.qrCodeUrl, pName)}
                        >
                          <FaQrcode /> View QR
                        </button>
                      </td>
                      <td>
                        {isCheckedOut ? (
                          <span className="badge-checked-out">Checked Out</span>
                        ) : isCheckedIn ? (
                          <span className="badge-checked-in">Checked In</span>
                        ) : (
                          <span className="badge-registered">Registered</span>
                        )}
                      </td>
                      <td className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                        {p.durationMinutes ? formatDuration(p.durationMinutes) : '—'}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          {!isCheckedIn && (
                            <button
                              className="btn btn-sm btn-success rounded-md d-inline-flex align-items-center gap-1 py-1"
                              onClick={() => handleCheckIn(p.id, pName)}
                              title="Manual Check-In"
                            >
                              <FaUserCheck /> Check In
                            </button>
                          )}
                          {isCheckedIn && !isCheckedOut && (
                            <button
                              className="btn btn-sm btn-warning rounded-md d-inline-flex align-items-center gap-1 py-1"
                              onClick={() => handleCheckOut(p.id, pName)}
                              title="Manual Check-Out"
                            >
                              <FaUserTimes /> Check Out
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-primary rounded-md p-1"
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Details"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-md p-1"
                            onClick={() => handleDelete(p.id, pName)}
                            title="Delete Participant"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom px-4 py-3 bg-light" style={{ borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaUserPlus className="text-primary" />
                  {isEditing ? 'Update Participant Details' : 'Register New Participant'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="+1 234 567 890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Registration Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        className="form-control"
                        placeholder="REG-1001"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Assign Event <span className="text-danger">*</span>
                      </label>
                      <select
                        name="eventId"
                        className="form-select"
                        value={formData.eventId}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Event...</option>
                        {events.map((evt) => (
                          <option key={evt.id} value={evt.id}>
                            {evt.eventName || evt.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        College / Institution <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="college"
                        className="form-control"
                        placeholder="Institute of Technology"
                        value={formData.college}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Department <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        className="form-control"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Year <span className="text-danger">*</span>
                      </label>
                      <select
                        name="year"
                        className="form-select"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
                  <button type="button" className="btn btn-secondary rounded-md px-3" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-md fw-semibold d-inline-flex align-items-center gap-2 px-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <FaSave /> {isEditing ? 'Save Changes' : 'Register & Generate QR'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
