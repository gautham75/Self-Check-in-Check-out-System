import React, { useEffect, useState, useCallback } from 'react';
import eventService from '../services/eventService';
import { notifyDataChanged, useDataSyncListener } from '../utils/dataSyncUtil';
import {
  FaCalendarPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSync,
  FaClock,
  FaSave
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const initialFormState = {
    eventName: '',
    location: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Subscribe to global data synchronization events
  useDataSyncListener(fetchEvents);

  const handleRefresh = () => {
    fetchEvents();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Event List Refreshed',
      showConfirmButton: false,
      timer: 1200
    });
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedEventId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setIsEditing(true);
    setSelectedEventId(evt.id);
    setFormData({
      eventName: evt.eventName || evt.name || '',
      location: evt.location || '',
      eventDate: evt.eventDate || evt.date || new Date().toISOString().split('T')[0],
      startTime: evt.startTime ? String(evt.startTime).substring(0, 5) : '09:00',
      endTime: evt.endTime ? String(evt.endTime).substring(0, 5) : '17:00',
      description: evt.description || '',
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
    setFormSubmitting(true);

    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };

    try {
      if (isEditing) {
        await eventService.updateEvent(selectedEventId, payload);
        Swal.fire({
          icon: 'success',
          title: 'Event Updated!',
          text: 'Event details updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await eventService.createEvent(payload);
        Swal.fire({
          icon: 'success',
          title: 'Event Created!',
          text: 'New event has been added to the system.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setShowModal(false);
      // Trigger global data synchronization & update local state
      notifyDataChanged();
      fetchEvents();
    } catch (err) {
      console.error('Error submitting event:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = (id, eventName) => {
    Swal.fire({
      title: 'Delete Event?',
      html: `Are you sure you want to delete <strong>${eventName || 'this event'}</strong>?<br/><small className="text-muted">This operation cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Event'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await eventService.deleteEvent(id);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Event has been removed.',
            timer: 1500,
            showConfirmButton: false
          });
          // Trigger global data synchronization & update local state
          notifyDataChanged();
          fetchEvents();
        } catch (err) {
          console.error('Delete event failed:', err);
        }
      }
    });
  };

  const filteredEvents = events.filter((e) => {
    const title = e.eventName || e.name || '';
    const loc = e.location || '';
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            Event Management
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Create, update, search, and manage system events
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 rounded-md"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh List"
          >
            <FaSync className={loading ? 'spin' : ''} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2 rounded-md fw-semibold shadow-sm"
            onClick={handleOpenCreateModal}
          >
            <FaCalendarPlus />
            <span>Create Event</span>
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
                placeholder="Search by event title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-7 text-md-end text-muted" style={{ fontSize: '0.875rem' }}>
            Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> total events
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading events...</span>
            </div>
            <p className="mt-2 text-muted mb-0" style={{ fontSize: '0.9rem' }}>Fetching events from server...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaCalendarAlt style={{ fontSize: '3rem' }} className="mb-3 text-secondary opacity-30" />
            <h6 className="fw-bold mb-1">No Events Found</h6>
            <p className="mb-3" style={{ fontSize: '0.875rem' }}>
              {searchTerm ? 'No events matched your search query.' : 'There are currently no events registered in the system.'}
            </p>
            <button className="btn btn-primary btn-sm rounded-md" onClick={handleOpenCreateModal}>
              <FaCalendarPlus className="me-1" /> Add Your First Event
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Name</th>
                  <th>Date &amp; Timing</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => {
                  const title = evt.eventName || evt.name || 'Untitled Event';
                  const dateStr = evt.eventDate || evt.date || 'N/A';
                  const timing = evt.startTime && evt.endTime
                    ? `${String(evt.startTime).substring(0, 5)} - ${String(evt.endTime).substring(0, 5)}`
                    : 'All Day';

                  return (
                    <tr key={evt.id}>
                      <td className="fw-semibold text-secondary">#{evt.id}</td>
                      <td>
                        <span className="fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
                          {title}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-column" style={{ fontSize: '0.85rem' }}>
                          <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                            <FaCalendarAlt className="text-primary" style={{ fontSize: '0.75rem' }} />
                            {dateStr}
                          </span>
                          <span className="text-muted d-flex align-items-center gap-1">
                            <FaClock style={{ fontSize: '0.75rem' }} />
                            {timing}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-dark" style={{ fontSize: '0.875rem' }}>
                          <FaMapMarkerAlt className="text-danger flex-shrink-0" style={{ fontSize: '0.8rem' }} />
                          <span>{evt.location || 'Online'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate text-muted" style={{ maxWidth: '240px', fontSize: '0.85rem' }}>
                          {evt.description || '—'}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-md d-inline-flex align-items-center gap-1"
                            onClick={() => handleOpenEditModal(evt)}
                            title="Edit Event"
                          >
                            <FaEdit /> <span className="d-none d-xl-inline">Edit</span>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-md d-inline-flex align-items-center gap-1"
                            onClick={() => handleDelete(evt.id, title)}
                            title="Delete Event"
                          >
                            <FaTrash /> <span className="d-none d-xl-inline">Delete</span>
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-bottom px-4 py-3 bg-light" style={{ borderTopLeftRadius: '14px', borderTopRightRadius: '14px' }}>
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FaCalendarPlus className="text-primary" />
                  {isEditing ? 'Update Event Details' : 'Create New Event'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Event Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        className="form-control"
                        placeholder="e.g. Annual Tech Symposium 2026"
                        value={formData.eventName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Location / Venue <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        placeholder="e.g. Main Auditorium"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Event Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        className="form-control"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        className="form-control"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        End Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        className="form-control"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows="3"
                        placeholder="Detailed information regarding the event..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
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
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <>
                        <FaSave /> {isEditing ? 'Save Changes' : 'Create Event'}
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

export default Events;
