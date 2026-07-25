import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  FaCog,
  FaServer,
  FaEnvelope,
  FaCloud,
  FaDatabase,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaShieldAlt,
  FaCode
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Settings = () => {
  const [backendOnline, setBackendOnline] = useState(null);
  const [checking, setChecking] = useState(false);
  const [latency, setLatency] = useState(null);

  const checkSystemHealth = async () => {
    setChecking(true);
    const startTime = performance.now();
    try {
      // Ping backend dashboard or events endpoint
      await api.get('/dashboard', { suppressErrorAlert: true });
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
      setBackendOnline(true);
    } catch (err) {
      console.warn('Backend ping failed:', err);
      setBackendOnline(false);
      setLatency(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const handleManualCheck = () => {
    checkSystemHealth();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Performing Health Diagnostics...',
      showConfirmButton: false,
      timer: 1200
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            System Configuration & Health
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Inspect backend connectivity, database status, cloud services, and system versions
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 rounded-md fw-medium px-3 py-2"
          onClick={handleManualCheck}
          disabled={checking}
        >
          <FaSync className={checking ? 'spin' : ''} />
          <span>Run Health Diagnostics</span>
        </button>
      </div>

      <div className="row g-4">
        {/* Backend API Status */}
        <div className="col-12 col-md-6">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaServer className="text-primary" /> Backend API Server
              </h5>
              {checking ? (
                <span className="badge bg-light text-secondary border">Checking...</span>
              ) : backendOnline ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                  <FaCheckCircle /> Online ({latency}ms)
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                  <FaTimesCircle /> Offline / Disconnected
                </span>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Backend Base Endpoint URL
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark fw-medium"
                value="http://localhost:8080/api"
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Framework & Runtime Environment
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="Spring Boot 3.5.4 (Java 17 OpenJDK)"
                readOnly
              />
            </div>

            <div className="mb-0">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                HTTP Request Timeout
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="15,000 ms (15 Seconds)"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Database & Infrastructure */}
        <div className="col-12 col-md-6">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaDatabase className="text-purple" /> Database & Persistence
              </h5>
              <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                <FaCheckCircle /> PostgreSQL Active
              </span>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Relational Database
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark fw-medium"
                value="PostgreSQL (Spring Data JPA / Hibernate)"
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Primary Tables & Entities
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="events, participants (Cascading & Indexes Enabled)"
                readOnly
              />
            </div>

            <div className="mb-0">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                ORM Migration Engine
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="Hibernate DDL Auto (update)"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Cloud Storage (AWS S3) */}
        <div className="col-12 col-md-6">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaCloud className="text-info" /> Cloud Object Storage
              </h5>
              <span className="badge bg-info-subtle text-info border border-info-subtle d-inline-flex align-items-center gap-1">
                <FaCheckCircle /> AWS S3 Configured
              </span>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Storage Provider
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark fw-medium"
                value="Amazon Web Services (AWS S3)"
                readOnly
              />
            </div>

            <div className="mb-0">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Assets Stored
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="Attendee QR Codes (ZXing) & Generated PDF Certificates (OpenPDF)"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Mail Dispatch Service */}
        <div className="col-12 col-md-6">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaEnvelope className="text-warning" /> Email Dispatch Service
              </h5>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle d-inline-flex align-items-center gap-1">
                <FaCheckCircle /> JavaMailSender Active
              </span>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Email Transport Client
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark fw-medium"
                value="Spring Boot Starter Mail (JavaMailSender)"
                readOnly
              />
            </div>

            <div className="mb-0">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>
                Trigger Dispatch Events
              </label>
              <input
                type="text"
                className="form-control bg-light text-dark"
                value="Participant Registration & Certificate Issuance"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Application System Information */}
        <div className="col-12">
          <div className="dashboard-card">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaShieldAlt className="text-primary" /> Application Architecture & Environment Info
              </h5>
              <span className="badge bg-light text-secondary border">Production Ready</span>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-3">
                <span className="text-muted d-block" style={{ fontSize: '0.8rem' }}>Frontend Stack</span>
                <strong className="text-dark">React 18 + Vite (JS)</strong>
              </div>

              <div className="col-12 col-md-3">
                <span className="text-muted d-block" style={{ fontSize: '0.8rem' }}>UI Design System</span>
                <strong className="text-dark">Bootstrap 5 + Custom Theme</strong>
              </div>

              <div className="col-12 col-md-3">
                <span className="text-muted d-block" style={{ fontSize: '0.8rem' }}>HTTP Service Layer</span>
                <strong className="text-dark">Axios (Global Interceptors)</strong>
              </div>

              <div className="col-12 col-md-3">
                <span className="text-muted d-block" style={{ fontSize: '0.8rem' }}>System Version</span>
                <strong className="text-primary">v1.0.0 Enterprise Release</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
