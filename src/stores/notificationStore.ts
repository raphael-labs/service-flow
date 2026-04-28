import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getEmpresaId } from '@/lib/getEmpresaId';

export interface AppNotification {
  id: string;
  cancel_at: string | null;
  read: boolean;
  serviceName: string;
  clientName: string;
  date: string;
  time: string;
  reason?: string;
  createdAt: string;
  type: string;
}

interface Store {
  notifications: AppNotification[];
  load: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<Store>((set, get) => ({
  notifications: [],

  // 🔥 CARREGAR NOTIFICAÇÕES
  load: async () => {
    const empresaId = await getEmpresaId();
    if (!empresaId) return;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        id,
        data_hora,
        created_at,
        cancel_at,
        lido,
        motivo_cancel,
        clientes ( name ),
        servicos ( name )
      `)
      .eq('empresa_id', empresaId)
      .or(`lido.eq.false,created_at.gte.${threeDaysAgo.toISOString()},cancel_at.gte.${threeDaysAgo.toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return;
    }

    const notifications = data.map((a: any) => {
      const dateObj = new Date(a.data_hora);

      return {
        id: a.id,
        type: a.cancel_at ? 'cancelled_appointment' : 'new_appointment',
        read: a.lido,
        serviceName: a.servicos?.name || '',
        clientName: a.clientes?.name || '',
        date: dateObj.toLocaleDateString(),
        time: dateObj.toTimeString().slice(0, 5),
        reason: a.motivo_cancel,
        createdAt: a.created_at,
        cancel_at: a.cancel_at,
      };
    });

    set({ notifications });
  },

  // 🔥 MARCAR UMA COMO LIDA
  markAsRead: async (id) => {
    const notification = get().notifications.find(n => n.id === id);

    if (!notification) return;

    try {
      if (notification.cancel_at) {
        // ❌ se foi cancelado → deleta do banco
        await supabase
          .from('agendamentos')
          .delete()
          .eq('id', id);

        // remove do estado
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      } else {
        // 🔔 normal → marca como lido
        await supabase
          .from('agendamentos')
          .update({ lido: true })
          .eq('id', id);

        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar notificação:', err);
    }
  },

  // 🔥 MARCAR TODAS COMO LIDAS
  markAllAsRead: async () => {
    const notifications = get().notifications;

    if (notifications.length === 0) return;

    try {
      const cancelados = notifications.filter(n => n.cancel_at).map(n => n.id);
      const ativos = notifications.filter(n => !n.cancel_at).map(n => n.id);

      // ❌ deletar cancelados
      if (cancelados.length > 0) {
        await supabase
          .from('agendamentos')
          .delete()
          .in('id', cancelados);
      }

      // 🔔 marcar ativos como lidos
      if (ativos.length > 0) {
        await supabase
          .from('agendamentos')
          .update({ lido: true })
          .in('id', ativos);
      }

      // atualizar estado
      set((state) => ({
        notifications: state.notifications
          .filter(n => !n.cancel_at) // remove cancelados
          .map(n => ({
            ...n,
            read: true,
          })),
      }));

    } catch (err) {
      console.error('Erro ao atualizar notificações:', err);
    }
  },

  // 🔥 CONTADOR
  unreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));