import { useState, useMemo } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { hasOverlap } from './CalendarGrid';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import type { Service, Client, Appointment } from '@/types';
import { useEffect } from 'react';

interface ScheduleFormProps {
  services: Service[];
  clients: Client[];
  date: string;
  time: string;
  existingAppointments?: Appointment[];
  dayConfig?: any[];
  appointment?: Appointment | null;
  onSubmit: (data: {
    client_id: string;
    service_id: string;
    date: string;
    time: string;
  }) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export default function ScheduleForm({ services, clients, date, time, appointment, dayConfig = [], existingAppointments = [], onSubmit, onCancel, onDelete }: ScheduleFormProps) {
  const [selectedClient, setSelectedClient] = useState(appointment?.cliente_id || '');
  const [selectedService, setSelectedService] = useState(appointment?.servico_id || '');
  const [formDate, setFormDate] = useState(
    appointment?.date || date
  );
  const [formTime, setFormTime] = useState(
    appointment?.time || time
  );
  const notify = useNotification();
  const { t } = useTranslation();
  const selectedServiceData = useMemo(
    () => services.find(s => s.id === selectedService),
    [services, selectedService]
  );




  /*const overlapError = useMemo(() => {
    if (!selectedServiceData || !formTime) return false;

    function getDayOfWeek(dateStr: string) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day).getDay();
    }
    const dayOfWeek = getDayOfWeek(formDate);
    const config = dayConfig?.find(
      d => d.dia_semana === dayOfWeek
    );

    const day = new Date(formDate).getDay();

    if (!config) return false;
    // 🔥 pega agendamentos do mesmo horário
    const sameTimeAppointments = existingAppointments.filter(a => {
      if (!a.data_hora) return false;
      if (appointment?.id && a.id === appointment.id) return false; // ignora o próprio agendamento quando estiver editando
      const d = new Date(a.data_hora);
      const h = d.toTimeString().slice(0, 5);
      const date = d.toISOString().split('T')[0];
      return date === formDate && h === formTime;
    });
    // 🔥 REGRA 1 - limite do dia
    if (sameTimeAppointments.length >= config.serv_simultaneo) {
      return true;
    }
    // 🔥 REGRA 2 - limite do serviço
    const sameServiceCount = sameTimeAppointments.filter(
      a => a.servico_id === selectedService
    ).length;

    if (sameServiceCount >= selectedServiceData.simultaneo) {
      return true;
    }

    return false;
  }, [formTime, formDate, selectedServiceData, existingAppointments, dayConfig, selectedService]);*/


  const overlapError = useMemo(() => {
    if (!selectedServiceData || !formTime) return false;

    function getDayOfWeek(dateStr: string) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day).getDay();
    }

    const dayOfWeek = getDayOfWeek(formDate);

    const config = dayConfig?.find(
      d => d.dia_semana === dayOfWeek
    );

    if (!config) return false;

    // 🔥 NOVO INTERVALO
    const newStart = new Date(`${formDate}T${formTime}:00`);
    const newEnd = new Date(
      newStart.getTime() + selectedServiceData.duracao * 60000
    );

    // 🔥 pega conflitos por intervalo
    const overlappingAppointments = existingAppointments.filter(a => {
      if (!a.data_hora) return false;

      // 🔥 IGNORA O PRÓPRIO
      if (appointment?.id && a.id === appointment.id) return false;

      const start = new Date(a.data_hora);
      const duration = a.duracao || 30;
      const end = new Date(start.getTime() + duration * 60000);

      // 🔥 REGRA DE OVERLAP REAL
      return newStart < end && newEnd > start;
    });

    // 🔥 REGRA 1 - limite do dia
    if (overlappingAppointments.length >= config.serv_simultaneo) {
      return true;
    }

    // 🔥 REGRA 2 - limite do serviço
    const sameServiceCount = overlappingAppointments.filter(
      a => a.servico_id === selectedService
    ).length;

    if (sameServiceCount >= selectedServiceData.simultaneo) {
      return true;
    }

    return false;
  }, [
    formTime,
    formDate,
    selectedServiceData,
    existingAppointments,
    dayConfig,
    selectedService,
    appointment
  ]);




  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClient);
    const service = selectedServiceData;
    if (!client || !service) return;

    if (overlapError) {
      notify.error(t('timeConflictToast'));
      return;
    }
    //passo5
    onSubmit({
      client_id: client.id,
      service_id: service.id,
      date: formDate,
      time: formTime,
      id: appointment?.id
    });
    //notify.success(t('appointmentCreated'));
  };

  useEffect(() => {
    if (!appointment) return;

    setSelectedClient(appointment.cliente_id);
    setSelectedService(appointment.servico_id);
    setFormDate(appointment.date);
    setFormTime(appointment.time);
  }, [appointment]);

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
          const symbol = s.moeda === 'USD' ? 'US$' : s.moeda === 'EUR' ? '€' : 'R$';
          const priceLabel = s.preco != null ? ` - ${symbol}${s.preco}` : '';
          return { value: s.id, label: `${s.name} (${s.duracao}min${priceLabel})` };
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

      {appointment && (
        <button
          type="button"
          onClick={() => {
            if (!appointment.id) return;

            onDelete?.(appointment.id)
          }}
          className="w-full text-sm text-destructive border border-destructive/30 rounded-lg py-2 hover:bg-destructive/10"
        >
          Excluir agendamento
        </button>
      )}
    </form>
  );
}
