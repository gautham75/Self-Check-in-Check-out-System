import React, { useEffect, useState } from 'react';
import reportService from '../services/reportService';
import eventService from '../services/eventService';
import { formatDateTime, formatDuration } from '../utils/formatters';
import {
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaChartBar,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
  FaSync,
  FaCheckCircle,
  FaUserCheck
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Reports = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const fetchInitialData = async () => {
    setLoadingPreview(true);
    try {
      const [eData, aData] = await Promise.all([
        eventService.getAllEvents().catch(() => []),
        reportService.getAttendanceReport().catch(() => [])
      ]);
      setEvents(Array.isArray(eData) ? eData : []);
      setAttendanceData(Array.isArray(aData) ? aData : []);
      if (eData.length > 0) {
        setSelectedEventId(eData[0].id);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const triggerFileDownload = (data, defaultFilename, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportAttendancePDF = async () => {
    setDownloading('pdf-attendance');
    try {
      const data = await reportService.exportAttendancePDF();
      triggerFileDownload(data, 'attendance_report.pdf', 'application/pdf');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'PDF Attendance Report Downloaded',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleExportAttendanceExcel = async () => {
    setDownloading('excel-attendance');
    try {
      const data = await reportService.exportAttendanceExcel();
      triggerFileDownload(data, 'attendance_report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Excel Attendance Report Downloaded',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleExportCSV = async () => {
    setDownloading('csv-participants');
    try {
      const data = await reportService.exportCSV();
      triggerFileDownload(data, 'participants_export.csv', 'text/csv');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'CSV File Downloaded',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleExportEventPDF = async () => {
    if (!selectedEventId) {
      Swal.fire('Select Event', 'Please select an event from the dropdown list.', 'info');
      return;
    }
    setDownloading('pdf-event');
    try {
      const data = await reportService.exportEventPDF(selectedEventId);
      triggerFileDownload(data, `event_report_${selectedEventId}.pdf`, 'application/pdf');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Event PDF Report Downloaded',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      console.error('Event PDF export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleExportEventExcel = async () => {
    if (!selectedEventId) {
      Swal.fire('Select Event', 'Please select an event from the dropdown list.', 'info');
      return;
    }
    setDownloading('excel-event');
    try {
      const data = await reportService.exportEventExcel(selectedEventId);
      triggerFileDownload(data, `event_report_${selectedEventId}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Event Excel Sheet Downloaded',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      console.error('Event Excel export error:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            Attendance & Event Reports
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Generate executive PDF reports, formatted Excel spreadsheets, and raw CSV files
          </p>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-md"
          onClick={fetchInitialData}
          disabled={loadingPreview}
        >
          <FaSync className={loadingPreview ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Global Export Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="dashboard-card text-center p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="card-icon-wrapper card-icon-red mx-auto mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
                <FaFilePdf />
              </div>
              <h5 className="fw-bold text-dark mb-2">PDF Attendance Report</h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                Executive printable PDF report containing participant check-in times, check-outs, and total durations.
              </p>
            </div>
            <button
              className="btn btn-outline-danger w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-md py-2"
              onClick={handleExportAttendancePDF}
              disabled={downloading === 'pdf-attendance'}
            >
              {downloading === 'pdf-attendance' ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <FaDownload /> Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="dashboard-card text-center p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="card-icon-wrapper card-icon-green mx-auto mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
                <FaFileExcel />
              </div>
              <h5 className="fw-bold text-dark mb-2">Excel Spreadsheet</h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                Structured `.xlsx` file designed for data filtering, pivot charts, and spreadsheet calculations.
              </p>
            </div>
            <button
              className="btn btn-outline-success w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-md py-2"
              onClick={handleExportAttendanceExcel}
              disabled={downloading === 'excel-attendance'}
            >
              {downloading === 'excel-attendance' ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <FaDownload /> Download Excel File
                </>
              )}
            </button>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <div className="dashboard-card text-center p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="card-icon-wrapper card-icon-blue mx-auto mb-3" style={{ width: '64px', height: '64px', fontSize: '2rem' }}>
                <FaFileCsv />
              </div>
              <h5 className="fw-bold text-dark mb-2">CSV Raw Export</h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
                Standard comma-separated text file compatible with external database imports and analytics engines.
              </p>
            </div>
            <button
              className="btn btn-outline-primary w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-md py-2"
              onClick={handleExportCSV}
              disabled={downloading === 'csv-participants'}
            >
              {downloading === 'csv-participants' ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <FaDownload /> Download CSV File
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Event Specific Report Section */}
      <div className="dashboard-card mb-4">
        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-primary" /> Event-Specific Reports
        </h5>
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>
              Select Event for Targeted Export:
            </label>
            <select
              className="form-select rounded-md"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">Select Event...</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.eventName || evt.name} (#{evt.id})
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-7 d-flex gap-2 align-items-end justify-content-md-end mt-md-4">
            <button
              className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2 rounded-md px-3 py-2"
              onClick={handleExportEventPDF}
              disabled={downloading === 'pdf-event' || !selectedEventId}
            >
              {downloading === 'pdf-event' ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <FaFilePdf /> Export Event PDF
                </>
              )}
            </button>
            <button
              className="btn btn-success fw-semibold d-inline-flex align-items-center gap-2 rounded-md px-3 py-2"
              onClick={handleExportEventExcel}
              disabled={downloading === 'excel-event' || !selectedEventId}
            >
              {downloading === 'excel-event' ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <FaFileExcel /> Export Event Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Preview Table */}
      <div className="dashboard-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Attendance Report Preview</h5>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Live summary of attendee records fetched from `/api/reports/attendance`</div>
          </div>
        </div>

        {loadingPreview ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading attendance report...</span>
            </div>
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <p className="mb-0">No attendance report records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Reg No.</th>
                  <th>Event Name</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Total Duration</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((item, idx) => {
                  const pName = item.participantName || item.fullName || item.name || 'Attendee';
                  const regNo = item.registrationNumber || `REG-${idx + 1}`;
                  const eName = item.eventName || 'Main Event';

                  return (
                    <tr key={idx}>
                      <td>
                        <div className="fw-bold text-dark">{pName}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{item.email || '—'}</div>
                      </td>
                      <td className="fw-medium text-secondary">{regNo}</td>
                      <td className="fw-semibold text-primary">{eName}</td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {formatDateTime(item.checkInTime)}
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {formatDateTime(item.checkOutTime)}
                      </td>
                      <td className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                        {item.durationMinutes ? formatDuration(item.durationMinutes) : (item.duration ? item.duration : '—')}
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

export default Reports;
