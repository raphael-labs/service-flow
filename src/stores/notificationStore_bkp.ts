import { create } from 'zustand';

export type NotificationType = 'new_appointment' | 'cancelled_appointment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  serviceName: string;
  clientName: string;
  date: string;
  time: string;
  reason?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
  loadMock: () => void;
}

const today = new Date().toISOString().split('T')[0];

const mockNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'new_appointment',
    serviceName: 'Corte de Cabelo',
    clientName: 'Carlos Oliveira',
    date: today,
    time: '09:00',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'cancelled_appointment',
    serviceName: 'Barba',
    clientName: 'Ana Santos',
    date: today,
    time: '10:00',
    reason: 'Conflito de horário',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'new_appointment',
    serviceName: 'Corte + Barba',
    clientName: 'Pedro Lima',
    date: today,
    time: '14:00',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    type: 'cancelled_appointment',
    serviceName: 'Corte de Cabelo',
    clientName: 'Maria Souza',
    date: today,
    time: '15:30',
    reason: 'Imprevisto pessoal',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (n) =>
    set({
      notifications: [
        {
          ...n,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...get().notifications,
      ],
    }),
  markAsRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }),
  markAllAsRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    }),
  clearAll: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  loadMock: () => set({ notifications: mockNotifications }),
}));
