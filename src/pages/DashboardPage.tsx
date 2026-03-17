import { useEffect } from 'react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useClientStore } from '@/stores/clientStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useAuthStore } from '@/stores/authStore';
import Card from '@/components/Card';
import AppointmentCard from '@/components/AppointmentCard';
import { CalendarDays, Users, Briefcase, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { appointments, loadMock: loadAppointments } = useAppointmentStore();
  const { clients, loadMock: loadClients } = useClientStore();
  const { services, loadMock: loadServices } = useServiceStore();
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    loadAppointments();
    loadClients();
    loadServices();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const stats = [
    { label: 'Agendamentos Hoje', value: todayAppointments.length, icon: CalendarDays, color: 'text-primary' },
    { label: 'Total Clientes', value: clients.length, icon: Users, color: 'text-emerald-600' },
    { label: 'Serviços Ativos', value: services.length, icon: Briefcase, color: 'text-amber-600' },
    { label: 'Este Mês', value: appointments.length, icon: TrendingUp, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">Olá, {user?.name?.split(' ')[0] || 'Usuário'} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Aqui está o resumo do seu dia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="stat-value mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's appointments */}
      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-3">Agendamentos de Hoje</h2>
        {todayAppointments.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento para hoje</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayAppointments.map(a => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
