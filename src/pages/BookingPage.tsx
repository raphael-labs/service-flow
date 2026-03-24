import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import FormInput from '@/components/FormInput';
import { Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointmentStore } from '@/stores/appointmentStore';

// Mock data for public booking
const mockServices = [
  { id: '1', name: 'Corte de Cabelo', duration: 30, price: 45 },
  { id: '2', name: 'Barba', duration: 30, price: 30 },
  { id: '3', name: 'Corte + Barba', duration: 60, price: 65 },
  { id: '4', name: 'Hidratação', duration: 45, price: 55 },
];

const allSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function slotConflicts(slotTime: string, serviceDuration: number, appointments: { time: string; duration: number }[]): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDuration;
  return appointments.some(a => {
    const aStart = timeToMinutes(a.time);
    const aEnd = aStart + a.duration;
    return slotStart < aEnd && slotEnd > aStart;
  });
}

type Step = 'service' | 'datetime' | 'info' | 'done';

export default function BookingPage() {
  const { slug } = useParams();
  const { appointments, addAppointment } = useAppointmentStore();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const service = mockServices.find(s => s.id === selectedService);

  // Filter slots: only show times where the selected service fits without conflicts
  const availableSlots = useMemo(() => {
    if (!selectedDate || !service) return allSlots;
    const dayAppointments = appointments.filter(a => a.date === selectedDate && a.status !== 'cancelled');
    return allSlots.filter(time => !slotConflicts(time, service.duration, dayAppointments));
  }, [selectedDate, service, appointments]);

  // Generate next 14 days
  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) result.push(d); // exclude sunday
    }
    return result;
  }, []);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (service) {
      addAppointment({
        id: crypto.randomUUID(),
        clientName: name,
        clientPhone: phone,
        clientEmail: email,
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        time: selectedTime,
        duration: service.duration,
        status: 'confirmed',
      });
    }
    setStep('done');
    toast.success('Agendamento confirmado!');
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['service', 'datetime', 'info'].map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === s ? 'bg-primary text-primary-foreground' :
            (['service', 'datetime', 'info'].indexOf(step) > i || step === 'done') ? 'bg-primary/20 text-primary' :
            'bg-secondary text-muted-foreground'
          }`}>
            {i + 1}
          </div>
          {i < 2 && <div className="w-8 h-0.5 bg-border rounded" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-8 pb-12 px-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground capitalize">
            {slug?.replace(/-/g, ' ') || 'Negócio'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Escolha o serviço e agende seu horário</p>
        </div>

        {step !== 'done' && stepIndicator}

        {/* Step 1: Service */}
        {step === 'service' && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Escolha o serviço</h2>
            {mockServices.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s.id); setStep('datetime'); }}
                className={`w-full card-elevated p-4 text-left hover:border-primary/30 transition-all flex items-center justify-between ${
                  selectedService === s.id ? 'border-primary bg-accent/50' : ''
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.duration} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">R$ {s.price}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('service')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button>
              <h2 className="text-base font-semibold text-foreground">Escolha data e horário</h2>
            </div>

            {service && (
              <div className="badge-primary text-xs">{service.name} · {service.duration}min · R${service.price}</div>
            )}

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Data</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {dates.map(d => {
                  const ds = d.toISOString().split('T')[0];
                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(ds)}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-all ${
                        selectedDate === ds
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      <span className="font-medium">{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                      <span className="text-base font-bold mt-0.5">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Horário</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {mockSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); setStep('info'); }}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:border-primary/30 text-foreground'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Info */}
        {step === 'info' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('datetime')} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button>
              <h2 className="text-base font-semibold text-foreground">Seus dados</h2>
            </div>

            <div className="card-elevated p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">{service?.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedTime} · {service?.duration}min
              </p>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <FormInput label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" required />
              <FormInput label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" required />
              <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              <button type="submit" className="btn-primary w-full">Confirmar Agendamento</button>
            </form>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground">Agendamento Confirmado!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Seu horário foi reservado. Você receberá uma confirmação por email.
            </p>
            <div className="card-elevated p-4 mt-6 text-left space-y-1 max-w-xs mx-auto">
              <p className="text-sm font-medium text-foreground">{service?.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {selectedTime}
              </p>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
            <button onClick={() => { setStep('service'); setSelectedService(''); setSelectedDate(''); setSelectedTime(''); setName(''); setPhone(''); setEmail(''); }} className="btn-outline mt-6">
              Fazer outro agendamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
