import { useState, useMemo } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { hasOverlap } from './CalendarGrid';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import type { Service, Client, Appointment } from '@/types';

interface ScheduleFormProps {
  services: Service[];
  clients: Client[];
  date: string;
  time: string;
  existingAppointments?: Appointment[];
  onSubmit: (data: { clientName: string; clientPhone: string; clientEmail: string; serviceId: string; serviceName: string; date: string; time: string; duration: number }) => void;
  onCancel: () => void;
}

export default function ScheduleForm({ services, clients, date, time, existingAppointments = [], onSubmit, onCancel }: ScheduleFormProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [formDate, setFormDate] = useState(date);
  const [formTime, setFormTime] = useState(time);
  const notify = useNotification();
  const { t } = useTranslation();

  const selectedServiceData = useMemo(
    () => services.find(s => s.id === selectedService),
    [services, selectedService]
  );

  const overlapError = useMemo(() => {
    if (!selectedServiceData || !formTime) return false;
    const sameDayAppts = existingAppointments.filter(a => a.date === formDate);
    return hasOverlap(formTime, selectedServiceData.duration, sameDayAppts);
  }, [formTime, formDate, selectedServiceData, existingAppointments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClient);
    const service = selectedServiceData;
    if (!client || !service) return;

    if (overlapError) {
      notify.error(t('timeConflictToast'));
      return;
    }

    onSubmit({
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      serviceId: service.id,
      serviceName: service.name,
      date: formDate,
      time: formTime,
      duration: service.duration,
    });
    notify.success(t('appointmentCreated'));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSelect
        label={t('client')}
        value={selectedClient}
        onChange={e => setSelectedClient(e.target.value)}
        options={clients.map(c => ({ value: c.id, label: c.name }))}
        required
      />
      <FormSelect
        label={t('service')}
        value={selectedService}
        onChange={e => setSelectedService(e.target.value)}
        options={services.map(s => {
          const symbol = s.currency === 'USD' ? 'US$' : s.currency === 'EUR' ? '€' : 'R$';
          const priceLabel = s.price != null ? ` - ${symbol}${s.price}` : '';
          return { value: s.id, label: `${s.name} (${s.duration}min${priceLabel})` };
        })}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput label={t('date')} type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
        <FormInput label={t('time')} type="time" value={formTime} onChange={e => setFormTime(e.target.value)} required />
      </div>

      {overlapError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          {t('timeConflict')}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={overlapError} className="btn-primary flex-1 disabled:opacity-50">{t('schedule')}</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">{t('cancel')}</button>
      </div>
    </form>
  );
}
