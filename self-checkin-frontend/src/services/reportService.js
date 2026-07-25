import api from './api';

const reportService = {
  getAttendanceReport: async () => {
    const response = await api.get('/reports/attendance');
    return response.data;
  },

  getEventReport: async (eventId) => {
    const response = await api.get(`/reports/event/${eventId}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/reports/statistics');
    return response.data;
  },

  exportAttendancePDF: async () => {
    const response = await api.get('/reports/attendance/export/pdf', { responseType: 'blob' });
    return response.data;
  },

  exportAttendanceExcel: async () => {
    const response = await api.get('/reports/attendance/export/excel', { responseType: 'blob' });
    return response.data;
  },

  exportEventPDF: async (eventId) => {
    const response = await api.get(`/reports/event/${eventId}/export/pdf`, { responseType: 'blob' });
    return response.data;
  },

  exportEventExcel: async (eventId) => {
    const response = await api.get(`/reports/event/${eventId}/export/excel`, { responseType: 'blob' });
    return response.data;
  },

  exportCSV: async () => {
    const response = await api.get('/reports/csv', { responseType: 'blob' });
    return response.data;
  },

  exportParticipantsPDF: async () => {
    const response = await api.get('/reports/pdf', { responseType: 'blob' });
    return response.data;
  }
};

export default reportService;
