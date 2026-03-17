import api from './api';
import type { Client } from '@/types';

export const clientService = {
  getAll: () => api.get<Client[]>('/clients'),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: Omit<Client, 'id'>) => api.post<Client>('/clients', data),
  update: (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  remove: (id: string) => api.delete(`/clients/${id}`),
};
