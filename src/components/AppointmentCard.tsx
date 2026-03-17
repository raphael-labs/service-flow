import type { Appointment } from '@/types';
import { Clock, User } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const statusColors: Record<string, string> = {
    confirmed: 'badge-success',
    pending: 'badge-primary',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    cancelled: 'Cancelado',
  };

  return (
    <div
      onClick={onClick}
      className="card-elevated p-3.5 cursor-pointer hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{appointment.clientName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{appointment.serviceName}</p>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{appointment.time} · {appointment.duration}min</span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[appointment.status] || 'badge-primary'}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>
    </div>
  );
}
