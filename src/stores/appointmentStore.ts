import { create } from 'zustand';
import type { Appointment } from '@/types';

const mockAppointments: Appointment[] = [
  { id: '1', clientName: 'Carlos Oliveira', clientPhone: '(11) 98888-1111', clientEmail: 'carlos@email.com', serviceId: '1', serviceName: 'Corte de Cabelo', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 30, status: 'confirmed' },
  { id: '2', clientName: 'Ana Santos', clientPhone: '(11) 98888-2222', clientEmail: 'ana@email.com', serviceId: '2', serviceName: 'Barba', date: new Date().toISOString().split('T')[0], time: '10:00', duration: 30, status: 'confirmed' },
  { id: '3', clientName: 'Pedro Lima', clientPhone: '(11) 98888-3333', clientEmail: 'pedro@email.com', serviceId: '3', serviceName: 'Corte + Barba', date: new Date().toISOString().split('T')[0], time: '14:00', duration: 60, status: 'pending' },
  { id: '4', clientName: 'Maria Souza', clientPhone: '(11) 98888-4444', clientEmail: 'maria@email.com', serviceId: '1', serviceName: 'Corte de Cabelo', date: new Date().toISOString().split('T')[0], time: '15:30', duration: 30, status: 'confirmed' },
];

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  setAppointments: (a: Appointment[]) => void;
  addAppointment: (a: Appointment) => void;
  removeAppointment: (id: string) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  loadMock: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,
  setAppointments: (appointments) => set({ appointments }),
  addAppointment: (a) => set({ appointments: [...get().appointments, a] }),
  removeAppointment: (id) => set({ appointments: get().appointments.filter(a => a.id !== id) }),
  updateAppointment: (id, data) => set({
    appointments: get().appointments.map(a => a.id === id ? { ...a, ...data } : a),
  }),
  loadMock: () => set({ appointments: mockAppointments, error: null }),
}));
