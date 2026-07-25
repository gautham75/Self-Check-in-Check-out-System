import api from './api';

const dashboardService = {
  /**
   * Fetch aggregate system metrics from GET /api/dashboard
   * Returns DashboardDTO: { totalEvents, totalParticipants, checkedIn, checkedOut, currentlyInside, certificatesGenerated }
   */
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;
