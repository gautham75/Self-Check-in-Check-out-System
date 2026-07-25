import api from './api';
import participantService from './participantService';

const scannerService = {
  scanQRCode: async (qrCodeData) => {
    // If input is a raw number (e.g. "1"), directly check in via checkInParticipant endpoint
    const cleanInput = String(qrCodeData).trim();

    if (/^\d+$/.test(cleanInput)) {
      const response = await participantService.checkIn(cleanInput);
      return response;
    }

    // Otherwise, post to /participants/scan with filePath/qrCodeData keys
    const response = await api.post('/participants/scan', {
      filePath: cleanInput,
      qrCodeData: cleanInput,
      qrText: cleanInput
    });
    return response.data;
  }
};

export default scannerService;
