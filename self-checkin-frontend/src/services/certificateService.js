import api from './api';

const certificateService = {
  generateCertificate: async (participantId) => {
    const response = await api.post(`/certificate/${participantId}`);
    return response.data;
  }
};

export default certificateService;
