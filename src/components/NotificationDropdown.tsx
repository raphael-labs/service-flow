import { useState, useRef, useEffect } from 'react';
import { Bell, CalendarPlus, CalendarX, Check, CheckCheck } from 'lucide-react';
import { useNotificationStore, type AppNotification } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

function NotificationItem({ notification, onRead }: { notification: AppNotification; onRead: () => void }) {
  const isNew = notification.type === 'new_appointment';
  const { t, language } = useTranslation();
  const dateFnsLocale = language === 'pt' ? ptBR : language === 'es' ? es : enUS;

  return (
    <button
      onClick={onRead}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-accent/50 border-b border-border last:border-b-0 ${!notification.read ? 'bg-accent/30' : ''
        }`}
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isNew ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/15 text-destructive'
          }`}>
          {isNew ? <CalendarPlus className="w-4 h-4" /> : <CalendarX className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
            {isNew ? t('newAppointmentNotif') : t('cancelledAppointmentNotif')}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{notification.serviceName}</p>
          <p className="text-xs text-muted-foreground truncate">{notification.clientName}</p>
          <p className="text-xs text-muted-foreground">
            {notification.date} • {notification.time}
          </p>
          {notification.reason && (
            <p className="text-xs text-destructive/80 mt-0.5 italic">{t('reason')}: {notification.reason}</p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {formatDistanceToNow(new Date(isNew ? notification.createdAt : notification.cancelAt), { addSuffix: true, locale: dateFnsLocale })}
          </p>
        </div>
        {!notification.read && (
          <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
        )}
      </div>
    </button>
  );
}

export default function NotificationDropdown() {
  //const { notifications, unreadCount, markAsRead, markAllAsRead, loadMock } = useNotificationStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, load } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = unreadCount();
  const { t } = useTranslation();

  /*useEffect(() => {
    if (notifications.length === 0) loadMock();
  }, []);*/



  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load();
    }, 600000); // 10 minutos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
        title={t('notifications')}
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-pulse">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">{t('notifications')}</h3>
            {count > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={() => markAsRead(n.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
