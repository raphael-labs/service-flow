import api from './api';
import type { Appointment } from '@/types';

export const appointmentService = {
  getAll: () => api.get<Appointment[]>('/appointments'),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: Omit<Appointment, 'id'>) => api.post<Appointment>('/appointments', data),
  update: (id: string, data: Partial<Appointment>) => api.put<Appointment>(`/appointments/${id}`, data),
  remove: (id: string) => api.delete(`/appointments/${id}`),
  getByDate: (date: string) => api.get<Appointment[]>(`/appointments?date=${date}`),
  // Public booking
  getAvailableSlots: (slug: string, date: string, serviceId: string) =>
    api.get<string[]>(`/booking/${slug}/slots?date=${date}&serviceId=${serviceId}`),
  createPublic: (slug: string, data: Omit<Appointment, 'id' | 'status'>) =>
    api.post(`/booking/${slug}/appointments`, data),
};
