import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

// Mock user for demo
const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '(11) 99999-9999',
  businessName: 'Barbearia do João',
  slug: 'barbearia-joao',
  address: 'Rua Exemplo, 123 - São Paulo, SP',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));

// Helper to do mock login
export const mockLogin = (email: string, _password: string) => {
  const user = { ...mockUser, email };
  useAuthStore.getState().setAuth(user, 'mock-jwt-token-12345');
  return user;
};

export const mockRegister = (name: string, email: string, businessName: string) => {
  const user: User = { ...mockUser, name, email, businessName, slug: businessName.toLowerCase().replace(/\s+/g, '-') };
  useAuthStore.getState().setAuth(user, 'mock-jwt-token-12345');
  return user;
};
