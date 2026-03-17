import { create } from 'zustand';
import type { Client } from '@/types';

const mockClients: Client[] = [
  { id: '1', name: 'Carlos Oliveira', phone: '(11) 98888-1111', email: 'carlos@email.com' },
  { id: '2', name: 'Ana Santos', phone: '(11) 98888-2222', email: 'ana@email.com' },
  { id: '3', name: 'Pedro Lima', phone: '(11) 98888-3333', email: 'pedro@email.com' },
  { id: '4', name: 'Maria Souza', phone: '(11) 98888-4444', email: 'maria@email.com' },
  { id: '5', name: 'Lucas Pereira', phone: '(11) 98888-5555', email: 'lucas@email.com' },
];

interface ClientState {
  clients: Client[];
  loading: boolean;
  setClients: (c: Client[]) => void;
  addClient: (c: Client) => void;
  removeClient: (id: string) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  loadMock: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  setClients: (clients) => set({ clients }),
  addClient: (c) => set({ clients: [...get().clients, c] }),
  removeClient: (id) => set({ clients: get().clients.filter(c => c.id !== id) }),
  updateClient: (id, data) => set({
    clients: get().clients.map(c => c.id === id ? { ...c, ...data } : c),
  }),
  loadMock: () => set({ clients: mockClients }),
}));
