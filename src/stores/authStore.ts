/*import { create } from 'zustand';
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
};*/

import { create } from 'zustand';
import type { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: SupabaseUser | null) => void;
  logout: () => void;
}

// 🔥 Função para mapear usuário do Supabase → seu modelo
const mapSupabaseUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
    businessName: user.user_metadata?.business_name || '',
    phone: '',
    slug: '',
    address: '',
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // 🔥 Define usuário baseado no Supabase
  setUser: (supabaseUser) => {
    if (!supabaseUser) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    const user = mapSupabaseUser(supabaseUser);

    set({
      user,
      isAuthenticated: true,
    });
  },

  // 🔐 Logout
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
