import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Card from '@/components/Card';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import { toast } from 'sonner';

const daysOfWeek = [
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
];

export default function ConfiguracoesPage() {
  const user = useAuthStore(s => s.user);

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  const [activeDays, setActiveDays] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotDuration, setSlotDuration] = useState('30');

  const toggleDay = (day: string) => {
    setActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Informações salvas com sucesso!');
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuração de agenda salva!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="page-header">Configurações</h1>

      {/* Business Info */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">Informações do Negócio</h2>
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <FormInput label="Nome da Empresa" value={businessName} onChange={e => setBusinessName(e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} />
            <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <FormInput label="Endereço" value={address} onChange={e => setAddress(e.target.value)} />
          <div className="pt-1">
            <button type="submit" className="btn-primary text-sm">Salvar Informações</button>
          </div>
        </form>
      </Card>

      {/* Schedule Config */}
      <Card>
        <h2 className="text-base font-semibold font-heading text-foreground mb-4">Configuração da Agenda</h2>
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Dias de Atendimento</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDays.includes(day.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <FormInput label="Início" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <FormInput label="Fim" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            <FormSelect
              label="Duração do Slot"
              value={slotDuration}
              onChange={e => setSlotDuration(e.target.value)}
              options={[
                { value: '15', label: '15 min' },
                { value: '30', label: '30 min' },
                { value: '45', label: '45 min' },
                { value: '60', label: '60 min' },
              ]}
            />
          </div>

          {/* Public link info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <p className="text-xs font-medium text-foreground mb-1">Link público de agendamento</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-card rounded px-3 py-2 text-muted-foreground border border-border truncate">
                {window.location.origin}/booking/{user?.slug || 'seu-negocio'}
              </code>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/booking/${user?.slug}`); toast.success('Link copiado!'); }}
                className="btn-outline text-xs px-3 py-2 shrink-0"
              >
                Copiar
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button type="submit" className="btn-primary text-sm">Salvar Agenda</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
