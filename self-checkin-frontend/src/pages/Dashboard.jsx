import React, { useEffect, useState, useCallback } from 'react';
import dashboardService from '../services/dashboardService';
import participantService from '../services/participantService';
import eventService from '../services/eventService';
import { useDataSyncListener } from '../utils/dataSyncUtil';
import MetricCard from '../components/dashboard/MetricCard';
import { AttendanceLineChart, EventDistributionBarChart } from '../components/dashboard/ActivityChart';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import {
  FaCalendarAlt,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaAward,
  FaDoorOpen,
  FaSync,
  FaChartLine,
  FaExclamationTriangle,
  FaCheck,
  FaPlay,
  FaPause,
  FaClock
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, participants, events] = await Promise.all([
        dashboardService.getDashboardData(),
        participantService.getAllParticipants().catch(() => []),
        eventService.getAllEvents().catch(() => [])
      ]);

      setStats(data);
      setRecentParticipants(Array.isArray(participants) ? participants.slice(0, 7) : []);
      setEventsList(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Unable to fetch dashboard statistics from backend API.');
      setStats({
        totalEvents: 0,
        totalParticipants: 0,
        checkedIn: 0,
        checkedOut: 0,
        currentlyInside: 0,
        certificatesGenerated: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Subscribe to global data synchronization events
  useDataSyncListener(fetchDashboardData);

  const handleRefresh = () => {
    fetchDashboardData();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'EventSync Data Refreshed',
      showConfirmButton: false,
      timer: 1200
    });
  };

  // Build dynamic event distribution data for bar chart
  const eventChartDistribution = {
    labels: eventsList.length > 0
      ? eventsList.map((e) => e.eventName || e.name || `Event #${e.id}`)
      : ['No Events Registered'],
    values: eventsList.length > 0
      ? eventsList.map((e) => {
          return recentParticipants.filter((p) => (p.event?.id === e.id) || (p.eventId === e.id)).length || 1;
        })
      : [0]
  };

  return (
    <div>
      {/* Modern Enterprise SaaS Branding Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill px-2.5 py-1" style={{ background: '#FFD036', color: '#1C1D21', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              LIVE PLATFORM
            </span>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
              EventSync Dashboard v1.0
            </span>
          </div>
          <h1 className="fw-extrabold mb-1" style={{ fontSize: '2rem', letterSpacing: '-0.03em', color: '#1C1D21' }}>
            Welcome back, {user?.fullName || 'Administrator'}
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '0.92rem', fontWeight: 500, maxWidth: '650px' }}>
            Monitor events, participants, attendance, certificates, and system activity in real time.
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-3 bg-white px-3.5 py-2 rounded-pill border shadow-sm">
            <div className="text-center px-1">
              <div className="fw-bold text-dark" style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>
                {loading ? '...' : (stats?.currentlyInside ?? 0)}
              </div>
              <div className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active On-Site</div>
            </div>
            <div className="vr" style={{ height: '24px', opacity: 0.15 }}></div>
            <div className="text-center px-1">
              <div className="fw-bold text-dark" style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>
                {loading ? '...' : (stats?.totalParticipants ?? 0)}
              </div>
              <div className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Registered</div>
            </div>
          </div>

          <button
            className="btn-crextio-dark d-flex align-items-center gap-2 shadow-sm px-3.5 py-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection Notice Alert if backend isn't reached */}
      {error && (
        <div className="alert d-flex align-items-center gap-2 rounded-4 mb-4 shadow-sm" style={{ background: '#FFF5D2', border: '1px solid #FFD036', color: '#1C1D21' }} role="alert">
          <FaExclamationTriangle className="flex-shrink-0" style={{ fontSize: '1.2rem', color: '#212227' }} />
          <div>
            <strong>Backend API Connection Notice:</strong> {error}
          </div>
        </div>
      )}

      {/* Top Bento Grid Section */}
      <div className="row g-4 mb-4">
        {/* Session Time Tracker Card */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="dashboard-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Time tracker</h5>
              <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: '#212227', color: '#FFD036' }}>
                <FaClock style={{ fontSize: '0.8rem' }} />
              </div>
            </div>

            <div className="my-3 text-center">
              <div className="time-tracker-circle">
                <div className="fw-extrabold" style={{ fontSize: '1.6rem', color: '#1C1D21' }}>02:35</div>
                <div className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Session Time</div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-2">
              <button className="btn rounded-circle d-flex align-items-center justify-content-center p-0" style={{ width: '36px', height: '36px', background: '#F5F3ED', color: '#212227' }}>
                <FaPlay style={{ fontSize: '0.75rem' }} />
              </button>
              <button className="btn rounded-circle d-flex align-items-center justify-content-center p-0" style={{ width: '36px', height: '36px', background: '#F5F3ED', color: '#212227' }}>
                <FaPause style={{ fontSize: '0.75rem' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Progress Bento Widget */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="dashboard-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="fw-bold mb-0 text-dark">Check-in Progress</h5>
              <span className="badge rounded-pill" style={{ background: '#FFD036', color: '#1C1D21', fontWeight: 700 }}>
                {stats?.totalParticipants ? `${Math.round(((stats?.checkedIn || 0) / stats.totalParticipants) * 100)}%` : '0%'}
              </span>
            </div>

            <div>
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <span className="stat-number-large">{stats?.checkedIn ?? 0}</span>
                <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Check-Ins Processed</span>
              </div>

              {/* Day Bars Visualization */}
              <div className="d-flex align-items-end justify-content-between gap-1 my-3" style={{ height: '90px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                  const heights = [30, 50, 75, 40, 85, 95, 20];
                  const isHighlight = idx === 5;
                  return (
                    <div key={idx} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                      <div
                        className="w-100 rounded-pill"
                        style={{
                          height: `${heights[idx]}px`,
                          background: isHighlight ? '#FFD036' : '#212227',
                          opacity: isHighlight ? 1 : 0.85
                        }}
                      ></div>
                      <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* System Status Checklist */}
        <div className="col-12 col-xl-4">
          <div className="dark-bento-card h-100 d-flex flex-column justify-content-between">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Check-In Checklist</h5>
              <span className="fw-extrabold" style={{ fontSize: '1.4rem', color: '#FFD036' }}>
                {eventsList.length > 0 ? '3/4' : '2/4'}
              </span>
            </div>

            <div className="dark-task-list">
              <div className="dark-task-item">
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.88rem' }}>Events Registered</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stats?.totalEvents ?? 0} active event(s)</div>
                </div>
                <div className="check-icon-gold"><FaCheck /></div>
              </div>

              <div className="dark-task-item">
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.88rem' }}>Database Sync Active</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>PostgreSQL Live Feed</div>
                </div>
                <div className="check-icon-gold"><FaCheck /></div>
              </div>

              <div className="dark-task-item">
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.88rem' }}>Attendees Checked In</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{stats?.checkedIn ?? 0} attendee(s)</div>
                </div>
                <div className={stats?.checkedIn > 0 ? "check-icon-gold" : "check-icon-muted"}>
                  {stats?.checkedIn > 0 && <FaCheck />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Total Events"
            value={loading ? '...' : (stats?.totalEvents ?? 0)}
            icon={<FaCalendarAlt />}
            colorClass="card-icon-blue"
            subtitle="Active &amp; Scheduled"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Total Participants"
            value={loading ? '...' : (stats?.totalParticipants ?? 0)}
            icon={<FaUsers />}
            colorClass="card-icon-purple"
            subtitle="Registered Attendees"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Checked In"
            value={loading ? '...' : (stats?.checkedIn ?? 0)}
            icon={<FaUserCheck />}
            colorClass="card-icon-orange"
            subtitle="Total Check-Ins"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Checked Out"
            value={loading ? '...' : (stats?.checkedOut ?? 0)}
            icon={<FaUserTimes />}
            colorClass="card-icon-red"
            subtitle="Total Check-Outs"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Certificates Generated"
            value={loading ? '...' : (stats?.certificatesGenerated ?? 0)}
            icon={<FaAward />}
            colorClass="card-icon-orange"
            subtitle="Generated &amp; Stored"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <MetricCard
            title="Participants Currently Inside"
            value={loading ? '...' : (stats?.currentlyInside ?? 0)}
            icon={<FaDoorOpen />}
            colorClass="card-icon-cyan"
            subtitle="Active On-Site"
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <FaChartLine style={{ color: '#FFD036' }} /> Attendance Hourly Trend
              </h5>
              <span className="badge border text-dark" style={{ background: '#F5F3ED', fontWeight: 600 }}>Today</span>
            </div>
            <AttendanceLineChart />
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="dashboard-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 text-dark">Event Distribution</h5>
              <span className="badge border text-dark" style={{ background: '#F5F3ED', fontWeight: 600 }}>Top Events</span>
            </div>
            <EventDistributionBarChart distribution={eventChartDistribution} />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="dashboard-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Recent Check-In Activity</h5>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Latest attendee scans and status updates</div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" style={{ color: '#FFD036' }} role="status">
              <span className="visually-hidden">Loading table data...</span>
            </div>
          </div>
        ) : (
          <RecentActivityTable participants={recentParticipants} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
