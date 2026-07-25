import React, { useEffect, useState } from 'react';
import certificateService from '../services/certificateService';
import participantService from '../services/participantService';
import {
  FaAward,
  FaCloudUploadAlt,
  FaEnvelope,
  FaExternalLinkAlt,
  FaPaperPlane,
  FaSearch,
  FaCheckCircle,
  FaUserCheck,
  FaSync,
  FaFilePdf
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Certificates = () => {
  const [participantId, setParticipantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [fetchingList, setFetchingList] = useState(true);
  const [issuedCert, setIssuedCert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchParticipants = async () => {
    setFetchingList(true);
    try {
      const data = await participantService.getAllParticipants();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching participants for certificates:', err);
    } finally {
      setFetchingList(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleGenerateCertificate = async (targetId) => {
    const pId = targetId || participantId;
    if (!pId) {
      Swal.fire('ID Required', 'Please enter or select a valid participant ID.', 'info');
      return;
    }

    setLoading(true);
    try {
      const response = await certificateService.generateCertificate(pId);
      
      const certUrl = response?.certificateUrl || (typeof response === 'string' ? response : null);
      const msg = response?.message || 'Certificate generated and dispatched successfully.';

      const resultObj = {
        participantId: pId,
        message: msg,
        certificateUrl: certUrl,
        generatedAt: new Date().toISOString()
      };

      setIssuedCert(resultObj);

      Swal.fire({
        icon: 'success',
        title: 'Certificate Issued!',
        html: `PDF generated, uploaded to AWS S3, and emailed.<br/><br/>
               <a href="${certUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary mt-2">
                 Open Certificate PDF
               </a>`,
        showConfirmButton: true,
        confirmButtonColor: '#2563eb'
      });

      setParticipantId('');
      fetchParticipants();
    } catch (err) {
      console.error('Certificate generation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Could not generate certificate for specified ID.';
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: errMsg,
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const pName = p.fullName || p.name || '';
    const regNo = p.registrationNumber || '';
    return (
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).includes(searchTerm)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            Certificate Generator & S3 Storage
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Generate PDF certificates, store on AWS S3 bucket, and dispatch automated email notifications
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-md"
          onClick={fetchParticipants}
          disabled={fetchingList}
        >
          <FaSync className={fetchingList ? 'spin' : ''} />
          <span>Refresh Attendees</span>
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* Form Card */}
        <div className="col-12 col-lg-5">
          <div className="dashboard-card h-100">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaAward className="text-primary" /> Issue Single Certificate
            </h5>

            <form onSubmit={(e) => { e.preventDefault(); handleGenerateCertificate(); }}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                  Target Participant ID
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Participant ID (e.g. 1)"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 px-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <FaPaperPlane /> Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-4 pt-3 border-top">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                Automated Workflow Steps:
              </h6>
              <ul className="list-unstyled text-muted" style={{ fontSize: '0.825rem' }}>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-success" /> 1. Generate PDF with OpenPDF template
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaCloudUploadAlt className="text-info" /> 2. Upload PDF directly to AWS S3
                </li>
                <li className="mb-2 d-flex align-items-center gap-2">
                  <FaEnvelope className="text-warning" /> 3. Dispatch Email with S3 Certificate link
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="col-12 col-lg-7">
          <div className="dashboard-card h-100">
            <h5 className="fw-bold text-dark mb-3">AWS S3 & Email Dispatch Status</h5>

            {issuedCert ? (
              <div className="p-4 bg-light rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                  <div className="d-flex align-items-center gap-2 text-success fw-bold">
                    <FaCheckCircle className="fs-5" /> Certificate Successfully Generated
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                    Participant ID: #{issuedCert.participantId}
                  </span>
                </div>

                <div className="row g-3 mb-3" style={{ fontSize: '0.875rem' }}>
                  <div className="col-6">
                    <span className="text-muted d-block">AWS S3 Upload Status</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1 mt-1">
                      <FaCloudUploadAlt /> Uploaded to S3 Bucket
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Email Notification</span>
                    <span className="badge bg-info-subtle text-info border border-info-subtle d-inline-flex align-items-center gap-1 mt-1">
                      <FaEnvelope /> Sent via JavaMailSender
                    </span>
                  </div>
                </div>

                {issuedCert.certificateUrl && (
                  <div className="mt-3 pt-3 border-top">
                    <label className="form-label text-muted d-block" style={{ fontSize: '0.8rem' }}>
                      AWS S3 Document Location:
                    </label>
                    <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 bg-white p-2.5 rounded-3 border">
                      <span className="text-truncate text-primary fw-medium" style={{ fontSize: '0.85rem' }}>
                        {issuedCert.certificateUrl}
                      </span>
                      <a
                        href={issuedCert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary fw-semibold d-inline-flex align-items-center gap-1 text-nowrap"
                      >
                        <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} /> Open Certificate PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <FaFilePdf className="mb-2 text-secondary opacity-30" style={{ fontSize: '3.5rem' }} />
                <h6 className="fw-bold mb-1">No Active Certificate Result</h6>
                <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                  Select or enter a participant ID above to generate a certificate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Directory Table for Quick Generation */}
      <div className="dashboard-card mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <div>
            <h5 className="fw-bold text-dark mb-0">Eligible Attendees Directory</h5>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Generate certificates for checked-in attendees directly from the list</div>
          </div>
          <div className="position-relative" style={{ minWidth: '240px' }}>
            <FaSearch className="position-absolute ms-3 top-50 translate-middle-y text-muted" />
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-md"
              placeholder="Search by ID, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {fetchingList ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">No eligible participants found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Participant</th>
                  <th>Registration No.</th>
                  <th>Status</th>
                  <th>Certificate S3 URL</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => {
                  const pName = p.fullName || p.name || 'Attendee';
                  const isCheckedIn = p.checkedIn || p.checkInTime != null;
                  const hasCert = !!p.certificateUrl;

                  return (
                    <tr key={p.id}>
                      <td className="fw-bold text-secondary">#{p.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{pName}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.email}</div>
                      </td>
                      <td className="fw-medium text-dark">{p.registrationNumber || `REG-${p.id}`}</td>
                      <td>
                        {isCheckedIn ? (
                          <span className="badge-checked-in d-inline-flex align-items-center gap-1">
                            <FaUserCheck style={{ fontSize: '0.75rem' }} /> Checked In
                          </span>
                        ) : (
                          <span className="badge-registered">Registered</span>
                        )}
                      </td>
                      <td>
                        {hasCert ? (
                          <a href={p.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-truncate d-inline-block" style={{ maxWidth: '200px', fontSize: '0.825rem' }}>
                            {p.certificateUrl}
                          </a>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Not Generated</span>
                        )}
                      </td>
                      <td className="text-end">
                        {hasCert ? (
                          <a
                            href={p.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-success rounded-md d-inline-flex align-items-center gap-1"
                          >
                            <FaExternalLinkAlt style={{ fontSize: '0.75rem' }} /> Open PDF
                          </a>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary rounded-md d-inline-flex align-items-center gap-1"
                            onClick={() => handleGenerateCertificate(p.id)}
                            disabled={loading}
                          >
                            <FaPaperPlane style={{ fontSize: '0.75rem' }} /> Generate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
