import { useEffect, useState } from 'react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useClientStore } from '@/stores/clientStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useAuthStore } from '@/stores/authStore';
import Card from '@/components/Card';
import AppointmentCard from '@/components/AppointmentCard';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { CalendarDays, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/getEmpresaId";


export default function DashboardPage() {
  /*const { appointments, loadMock: loadAppointments } = useAppointmentStore();
  const { clients, loadMock: loadClients } = useClientStore();
  const { services, loadMock: loadServices } = useServiceStore();*/
  const { appointments } = useAppointmentStore();
  const { clients } = useClientStore();
  const { services } = useServiceStore();
  const user = useAuthStore(s => s.user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  /*useEffect(() => {
    setIsLoading(true);
    try {
      loadAppointments();
      loadClients();
      loadServices();
    } catch {
      setError(t('errorLoadingDashboard'));
    }
    const ti = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(ti);
  }, []);*/

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const empresaId = await getEmpresaId();

        if (!empresaId) throw new Error("Empresa não encontrada");

        // 🔥 appointments
        const { data: appointmentsData } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("empresa_id", empresaId);

        // 🔥 clients
        const { data: clientsData } = await supabase
          .from("clientes")
          .select("*")
          .eq("empresa_id", empresaId);

        // 🔥 services
        const { data: servicesData } = await supabase
          .from("servicos")
          .select("*")
          .eq("empresa_id", empresaId);

        // 👉 joga nos estados (ou stores)
        useAppointmentStore.setState({ appointments: appointmentsData || [] });
        useClientStore.setState({ clients: clientsData || [] });
        useServiceStore.setState({ services: servicesData || [] });

      } catch (err) {
        console.error(err);
        setError(t('errorLoadingDashboard'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => { setError(null); loadAppointments(); loadClients(); loadServices(); setIsLoading(false); }} />;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const stats = [
    { label: t('appointmentsToday'), value: todayAppointments.length, icon: CalendarDays, color: 'text-primary' },
    { label: t('totalClients'), value: clients.length, icon: Users, color: 'text-emerald-600' },
    { label: t('activeServices'), value: services.length, icon: Briefcase, color: 'text-amber-600' },
    { label: t('thisMonth'), value: appointments.length, icon: TrendingUp, color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header">{t('hello')}, {user?.name?.split(' ')[0] || t('user')} 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('daySummary')}</p>
      </div>

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

      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-3">{t('todayAppointments')}</h2>
        {todayAppointments.length === 0 ? (
          <div className="card-elevated">
            <EmptyState
              icon={CalendarDays}
              title={t('noAppointmentsToday')}
              description={t('goToAgenda')}
            />
          </div>
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
