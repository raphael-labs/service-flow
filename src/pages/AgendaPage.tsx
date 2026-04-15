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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/getEmpresaId";
import ConfirmModal from '@/components/ConfirmModal';

export default function AgendaPage() {
  const { appointments } = useAppointmentStore();
  const { clients } = useClientStore();
  const { services } = useServiceStore();
  const [diasSemana, setDiasSemana] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notify = useNotification();
  const { t, locale } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const handleAskDelete = (id: string) => {
    setAppointmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await supabase
        .from("agendamentos")
        .delete()
        .eq("id", appointmentToDelete);

      notify.success("Agendamento excluído");

      setDeleteModalOpen(false);
      setAppointmentToDelete(null);
      setModalOpen(false);

      await loadData();
    } catch (err) {
      console.error(err);
      notify.error("Erro ao excluir");
    }
  };

  // 🔥 LOAD
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const empresaId = await getEmpresaId();
      const { data: appt } = await supabase //alterar para pegar somente agendamentos do dia
        .from("agendamentos")
        .select("*")
        .eq("empresa_id", empresaId);
      const { data: cli } = await supabase // alterar para um modo mais eficiente disso digitar e buscar, algo assim
        .from("clientes")
        .select("*")
        .eq("empresa_id", empresaId);
      const { data: srv } = await supabase
        .from("servicos")
        .select("*")
        .eq("empresa_id", empresaId);
      const { data: dias } = await supabase
        .from("dias_semanais")
        .select("*")
        .eq("empresa_id", empresaId);

      useAppointmentStore.setState({ appointments: appt || [] });
      useClientStore.setState({ clients: cli || [] });
      useServiceStore.setState({ services: srv || [] });
      setDiasSemana(dias || []);

    } catch (err) {
      console.error(err);
      setError("Erro ao carregar agenda");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // 🔥 DIA CONFIG
  function getDayOfWeek(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
  }
  const dayOfWeek = getDayOfWeek(dateStr);
  const dayConfig = diasSemana.find(
    d => Number(d.dia_semana) === dayOfWeek
  );
  const isActiveDay = !!dayConfig;

  // 🔥 CLICK SLOT
  const handleSlotClick = (time: string) => {
    if (!isActiveDay) return;

    setSelectedTime(time);
    setEditingAppointment(null);
    setModalOpen(true);
  };

  // 🔥 EDITAR
  const handleEdit = (appt: any) => {
    setEditingAppointment(appt);
    setSelectedTime(appt.time);
    setModalOpen(true);
  };

  const handleNewAppointment = async (data: any) => {
    const empresaId = await getEmpresaId();

    const dataHora = new Date(`${data.date}T${data.time}:00`);

    if (data.id) {
      // 🔥 UPDATE
      await supabase
        .from("agendamentos")
        .update({
          cliente_id: data.client_id,
          servico_id: data.service_id,
          data_hora: dataHora.toISOString(),
        })
        .eq("id", data.id);
      notify.success(t('appointmentUpdated'));

    } else {
      // 🔥 CREATE
      await supabase.from("agendamentos").insert({
        empresa_id: empresaId,
        cliente_id: data.client_id,
        servico_id: data.service_id,
        data_hora: dataHora.toISOString(),
      });
      notify.success(t('appointmentCreated'));
    }

    await loadData();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

      notify.success("Agendamento excluído");

      await loadData();
      setModalOpen(false);

    } catch (err) {
      console.error(err);
      notify.error("Erro ao excluir agendamento");
    }
  };

  // 🔥 FORMATAR
  const formattedAppointments = appointments.map(a => {
    if (!a.data_hora) return a;

    const d = new Date(a.data_hora);
    const service = services.find(s => s.id === a.servico_id);

    return {
      ...a,
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().slice(0, 5),
      duracao: service?.duracao ?? 30,
      clientName: clients.find(c => c.id === a.cliente_id)?.name || 'Cliente',
      serviceName: service?.name || 'Serviço',
    };
  });

  const todayAppointments = formattedAppointments.filter(a => a.date === dateStr);

  if (isLoading) return <AgendaSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-header">{t('agenda')}</h1>

        {/* 🔥 BLOQUEIA BOTÃO */}
        <button
          onClick={() => handleSlotClick('08:00')}
          disabled={!isActiveDay}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {t('newAppointment')}
        </button>
      </div>

      {/* NAV */}
      <div className="card-elevated p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => goDay(-7)} className="btn-ghost p-2">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-medium">
            {currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
          </span>

          <button onClick={() => goDay(7)} className="btn-ghost p-2">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(d => {
            const isSelected = d.toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={d.toISOString()}
                onClick={() => setCurrentDate(new Date(d))}
                className={`py-2 rounded-lg text-xs ${isSelected ? 'bg-primary text-white' : 'hover:bg-secondary'
                  }`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      <div className="card-elevated p-4">
        {!isActiveDay ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            🚫 Dia não habilitado — configure em "Dias da semana"
          </div>
        ) : (
          <CalendarGrid
            date={dateStr}
            appointments={formattedAppointments}
            onSlotClick={handleSlotClick}
            onEdit={handleEdit}
            diasSemana={diasSemana}
          />
        )}
      </div>

      {/* MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAppointment ? "Editar agendamento" : t('newAppointment')}
      >
        <ScheduleForm
          services={services}
          clients={clients}
          date={dateStr}
          time={selectedTime}
          existingAppointments={todayAppointments}
          onSubmit={handleNewAppointment}
          onCancel={() => setModalOpen(false)}
          dayConfig={diasSemana}
          appointment={editingAppointment}
          onDelete={handleAskDelete}
        />
      </Modal>

      <ConfirmModal
        open={deleteModalOpen}
        title="Excluir agendamento"
        description="Tem certeza que deseja excluir este agendamento? Essa ação não pode ser desfeita."
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}