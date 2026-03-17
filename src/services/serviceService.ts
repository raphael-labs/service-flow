import api from './api';
import type { Service } from '@/types';

export const serviceService = {
  getAll: () => api.get<Service[]>('/services'),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: Omit<Service, 'id'>) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  remove: (id: string) => api.delete(`/services/${id}`),
};
