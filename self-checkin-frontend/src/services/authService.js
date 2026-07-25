import api from './api';

const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password
    });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;
