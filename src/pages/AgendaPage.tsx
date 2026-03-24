import { useEffect, useState } from 'react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useClientStore } from '@/stores/clientStore';
import { useServiceStore } from '@/stores/serviceStore';
import CalendarGrid from '@/components/CalendarGrid';
import Modal from '@/components/Modal';
import ScheduleForm from '@/components/ScheduleForm';
import AgendaSkeleton from '@/components/AgendaSkeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

export default function AgendaPage() {
  const { appointments, loadMock, addAppointment, loading, error } = useAppointmentStore();
  const { clients, loadMock: loadClients } = useClientStore();
  const { services, loadMock: loadServices } = useServiceStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [isLoading, setIsLoading] = useState(true);
  const notify = useNotification();

  useEffect(() => {
    setIsLoading(true);
    loadMock();
    loadClients();
    loadServices();
    // Simulate loading
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const dateStr = currentDate.toISOString().split('T')[0];

  const goDay = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    const day = d.getDay();
    d.setDate(d.getDate() - day + i);
    return d;
  });

  const handleSlotClick = (time: string) => {
    setSelectedTime(time);
    setModalOpen(true);
  };

  const handleNewAppointment = (data: any) => {
    addAppointment({ ...data, id: crypto.randomUUID(), status: 'confirmed' });
    setModalOpen(false);
  };

  const todayAppointments = appointments.filter(a => a.date === dateStr);

  if (isLoading) return <AgendaSkeleton />;

  if (error) return <ErrorState message={error} onRetry={() => { loadMock(); }} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">Agenda</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
          + Novo Agendamento
        </button>
      </div>

      {/* Week navigation */}
      <div className="card-elevated p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => goDay(-7)} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium text-foreground">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => goDay(7)} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => {
            const isSelected = d.toISOString().split('T')[0] === dateStr;
            const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            const dayCount = appointments.filter(a => a.date === d.toISOString().split('T')[0]).length;
            return (
              <button
                key={d.toISOString()}
                onClick={() => setCurrentDate(new Date(d))}
                className={`flex flex-col items-center py-2 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : isToday
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
              >
                <span className="font-medium">{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                <span className="text-lg font-bold mt-0.5">{d.getDate()}</span>
                {dayCount > 0 && (
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-elevated p-4 overflow-auto max-h-[60vh]">
        {todayAppointments.length === 0 && appointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhum agendamento"
            description="Clique em um horário ou no botão acima para criar seu primeiro agendamento."
          />
        ) : (
          <CalendarGrid
            date={dateStr}
            appointments={appointments}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Agendamento">
        <ScheduleForm
          services={services}
          clients={clients}
          date={dateStr}
          time={selectedTime}
          existingAppointments={appointments.filter(a => a.date === dateStr)}
          onSubmit={handleNewAppointment}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
