import api from './api';

const participantService = {
  getAllParticipants: async () => {
    const response = await api.get('/participants');
    return response.data;
  },

  getParticipantById: async (id) => {
    const response = await api.get(`/participants/${id}`);
    return response.data;
  },

  createParticipant: async (participantData) => {
    const response = await api.post('/participants', participantData);
    return response.data;
  },

  updateParticipant: async (id, participantData) => {
    const response = await api.put(`/participants/${id}`, participantData);
    return response.data;
  },

  deleteParticipant: async (id) => {
    const response = await api.delete(`/participants/${id}`);
    return response.data;
  },

  checkIn: async (id) => {
    const response = await api.post(`/participants/checkin/${id}`);
    return response.data;
  },

  checkOut: async (id) => {
    const response = await api.post(`/participants/checkout/${id}`);
    return response.data;
  },

  searchParticipants: async (query) => {
    const response = await api.get('/participants/search', { params: { query } });
    return response.data;
  }
};

export default participantService;
