import { Clock, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AppointmentCardProps {
  appointment: any;
  onClick?: () => void;
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const { t } = useTranslation();

  const date = new Date(appointment.data_hora);

  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const clientName = appointment.clientes?.name || 'Sem cliente';
  const serviceName = appointment.servicos?.name || 'Sem serviço';
  const duration = appointment.servicos?.duracao || 0;

  // 🔥 status simples baseado no banco
  //let status = 'pending'; mudar isso depois que adicionar funcionalidade
  let status = 'created';

  if (appointment.cancel_at) {
    status = 'cancelled';
  } else if (appointment.confirm_at) {
    status = 'confirmed';
  }

  const statusColors: Record<string, string> = {
    confirmed: 'badge-success',
    pending: 'badge-primary',
    created: 'badge-primary',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    confirmed: t('confirmed'),
    pending: t('pending'),
    created: t('created'),
    cancelled: t('cancelled'),
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
            <span className="truncate">{clientName}</span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {serviceName}
          </p>

          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {time} · {duration}min
            </span>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}