import React, { useState, useEffect } from 'react';
import { useParams } from 'react';
import api from '../services/api';
import { resolveApiUrl } from '../utils/formatters';
import { FaShieldAlt, FaSync, FaClock, FaCheckCircle, FaExclamationTriangle, FaIdCard } from 'react-icons/fa';

const DigitalPass = () => {
  const { participantId } = useParams();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());

  const fetchPassData = async () => {
    try {
      const response = await api.get(`/participants/dynamic-pass/${participantId}`);
      setPassData(response.data);
      if (response.data.secondsRemaining) {
        setSecondsRemaining(response.data.secondsRemaining);
      }
      setQrTimestamp(Date.now());
      setError(null);
    } catch (err) {
      console.error('Failed to load pass details:', err);
      setError(err.response?.data?.message || 'Unable to load digital event pass.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassData();
  }, [participantId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setQrTimestamp(Date.now());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white p-4">
        <div className="spinner-border mb-3 text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading secure pass...</span>
        </div>
        <h5 className="fw-bold">Generating Live Security Pass...</h5>
      </div>
    );
  }

  if (error || !passData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white p-4">
        <div className="card bg-secondary text-white border-0 shadow-lg text-center p-4" style={{ maxWidth: '420px' }}>
          <FaExclamationTriangle className="text-warning display-3 mb-3 mx-auto" />
          <h4 className="fw-bold mb-2">Digital Pass Notice</h4>
          <p className="text-muted">{error || 'Pass details not found.'}</p>
        </div>
      </div>
    );
  }

  const { participant } = passData;
  const eventName = participant.event?.eventName || 'EventSync Event';

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' }}>
      <div className="card border-0 shadow-lg text-white overflow-hidden w-100" style={{ maxWidth: '440px', borderRadius: '24px', background: '#1A1D24', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        {/* Pass Header */}
        <div className="p-4 text-center border-bottom" style={{ backgroundColor: '#212227', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: 'rgba(255, 208, 54, 0.15)', border: '1px solid #FFD036', color: '#FFD036', fontSize: '0.78rem', fontWeight: 800 }}>
            <FaShieldAlt /> LIVE ANTI-PROXY DIGITAL PASS
          </div>
          <h4 className="fw-bold text-white mb-0">{eventName}</h4>
        </div>

        {/* QR Code Container */}
        <div className="p-4 text-center bg-dark position-relative">
          <div className="position-relative d-inline-block p-3 bg-white rounded-4 shadow-sm mb-3">
            <img 
              src={resolveApiUrl(`http://localhost:8080/api/participants/dynamic-qr/${participantId}?t=${qrTimestamp}`)} 
              alt="Dynamic Event Security Pass QR"
              className="img-fluid"
              style={{ width: '220px', height: '220px' }}
            />
          </div>

          {/* Refresh Timer Bar */}
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span className="spinner-grow spinner-grow-sm text-success" role="status" />
            <span className="fw-bold text-success" style={{ fontSize: '0.88rem' }}>
              <FaCheckCircle className="me-1" /> Active Security Token
            </span>
          </div>

          <div className="d-inline-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1.5 rounded-3 text-muted" style={{ fontSize: '0.82rem' }}>
            <FaClock className="text-warning" />
            <span>Refreshes in <strong className="text-warning fs-6">{secondsRemaining}s</strong></span>
            <button onClick={fetchPassData} className="btn btn-link btn-sm p-0 text-warning ms-2" title="Force Refresh">
              <FaSync />
            </button>
          </div>
        </div>

        {/* Participant Details */}
        <div className="p-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold" style={{ width: '48px', height: '48px', backgroundColor: '#FFD036', fontSize: '1.2rem' }}>
              <FaIdCard />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">{participant.fullName}</h5>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>{participant.registrationNumber}</span>
            </div>
          </div>

          <div className="bg-dark bg-opacity-50 rounded-3 p-3 mb-3" style={{ fontSize: '0.85rem' }}>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Department:</span>
              <span className="fw-semibold text-light">{participant.department || 'N/A'} ({participant.year ? `Yr ${participant.year}` : 'N/A'})</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">College:</span>
              <span className="fw-semibold text-light">{participant.college || 'N/A'}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Email:</span>
              <span className="fw-semibold text-light">{participant.email}</span>
            </div>
          </div>

          {/* Anti-Proxy Warning Banner */}
          <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning d-flex align-items-start gap-2 mb-0" style={{ fontSize: '0.78rem', borderRadius: '12px' }}>
            <FaExclamationTriangle className="flex-shrink-0 mt-0.5" style={{ fontSize: '1.1rem' }} />
            <div>
              <strong>Anti-Proxy Notice:</strong> Screenshots are disabled. Expired QR pass screenshots will be rejected by gate scanners. Show this live screen at entry.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DigitalPass;
