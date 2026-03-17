import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; businessName: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
  },
};
