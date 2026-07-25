import React from 'react';
import { formatDateTime, formatDuration } from '../../utils/formatters';
import { FaUserCheck, FaUserTimes, FaClock } from 'react-icons/fa';

const RecentActivityTable = ({ participants }) => {
  if (!participants || participants.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p className="mb-0 fw-medium">No recent check-in activity recorded.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>Email</th>
            <th>Event</th>
            <th>Status</th>
            <th>Check-In Time</th>
            <th>Check-Out Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const displayName = p.fullName || p.name || 'Attendee';
            const displayEvent = p.event?.eventName || p.eventName || 'Main Event';
            const isCheckedIn = p.checkedIn || p.checkInTime != null;
            const isCheckedOut = p.checkedOut || p.checkOutTime != null;

            return (
              <tr key={p.id || p.participantId}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '34px', height: '34px', fontSize: '0.85rem', background: '#212227', color: '#FFD036' }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="fw-bold text-dark">{displayName}</span>
                  </div>
                </td>
                <td className="text-muted" style={{ fontSize: '0.88rem' }}>{p.email || 'N/A'}</td>
                <td className="fw-semibold text-primary">{displayEvent}</td>
                <td>
                  {isCheckedOut ? (
                    <span className="badge-checked-out d-inline-flex align-items-center gap-1">
                      <FaUserTimes style={{ fontSize: '0.75rem' }} /> Checked Out
                    </span>
                  ) : isCheckedIn ? (
                    <span className="badge-checked-in d-inline-flex align-items-center gap-1">
                      <FaUserCheck style={{ fontSize: '0.75rem' }} /> Checked In
                    </span>
                  ) : (
                    <span className="badge-registered d-inline-flex align-items-center gap-1">
                      <FaClock style={{ fontSize: '0.75rem' }} /> Registered
                    </span>
                  )}
                </td>
                <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {formatDateTime(p.checkInTime)}
                </td>
                <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {formatDateTime(p.checkOutTime)}
                </td>
                <td className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                  {p.durationMinutes ? formatDuration(p.durationMinutes) : (p.duration ? formatDuration(p.duration) : '—')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentActivityTable;
