import { create } from 'zustand';
import type { Service } from '@/types';

const mockServices: Service[] = [
  { id: '1', name: 'Corte de Cabelo', duration: 30, price: 45, currency: 'BRL', simultaneousSlots: 1 },
  { id: '2', name: 'Barba', duration: 30, price: 30, currency: 'BRL', simultaneousSlots: 1 },
  { id: '3', name: 'Corte + Barba', duration: 60, price: 65, currency: 'BRL', simultaneousSlots: 1 },
  { id: '4', name: 'Hidratação', duration: 45, price: 55, currency: 'BRL', simultaneousSlots: 1 },
  { id: '5', name: 'Sobrancelha', duration: 15, price: 20, currency: 'BRL', simultaneousSlots: 2 },
];

interface ServiceState {
  services: Service[];
  loading: boolean;
  setServices: (s: Service[]) => void;
  addService: (s: Service) => void;
  removeService: (id: string) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  loadMock: () => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loading: false,
  setServices: (services) => set({ services }),
  addService: (s) => set({ services: [...get().services, s] }),
  removeService: (id) => set({ services: get().services.filter(s => s.id !== id) }),
  updateService: (id, data) => set({
    services: get().services.map(s => s.id === id ? { ...s, ...data } : s),
  }),
  loadMock: () => set({ services: mockServices }),
}));
