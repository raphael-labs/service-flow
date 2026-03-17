import { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import type { Service, Client } from '@/types';

interface ScheduleFormProps {
  services: Service[];
  clients: Client[];
  date: string;
  time: string;
  onSubmit: (data: { clientName: string; clientPhone: string; clientEmail: string; serviceId: string; serviceName: string; date: string; time: string; duration: number }) => void;
  onCancel: () => void;
}

export default function ScheduleForm({ services, clients, date, time, onSubmit, onCancel }: ScheduleFormProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [formDate, setFormDate] = useState(date);
  const [formTime, setFormTime] = useState(time);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClient);
    const service = services.find(s => s.id === selectedService);
    if (!client || !service) return;
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSelect
        label="Cliente"
        value={selectedClient}
        onChange={e => setSelectedClient(e.target.value)}
        options={clients.map(c => ({ value: c.id, label: c.name }))}
        required
      />
      <FormSelect
        label="Serviço"
        value={selectedService}
        onChange={e => setSelectedService(e.target.value)}
        options={services.map(s => ({ value: s.id, label: `${s.name} (${s.duration}min - R$${s.price})` }))}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Data" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
        <FormInput label="Horário" type="time" value={formTime} onChange={e => setFormTime(e.target.value)} required />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1">Agendar</button>
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancelar</button>
      </div>
    </form>
  );
}
