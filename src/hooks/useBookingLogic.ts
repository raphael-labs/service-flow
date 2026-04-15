import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useBusinessImageStore } from '@/stores/businessImageStore';
import { useTranslation } from '@/hooks/useTranslation';

export type Step = 'service' | 'datetime' | 'info' | 'done';

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayOfWeek(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function formatCurrency(currency: string) {
  if (currency === 'USD') return 'US$';
  if (currency === 'EUR') return '€';
  return 'R$';
}

export function useBookingLogic() {
  const { slug } = useParams();
  const { setLogo, setExtraImage, setBookingStyle, logo, extraImage, bookingStyle } = useBusinessImageStore();
  const { t, locale } = useTranslation();

  const [empresa, setEmpresa] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [diasSemana, setDiasSemana] = useState<any[]>([]);

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 🔥 LOAD REAL
  /*useEffect(() => {
    async function load() {
      const { data: emp } = await supabase
        .from('empresas')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!emp) return;

      setEmpresa(emp);
      setLogo(emp.path_img_logo);
      setExtraImage(emp.path_img_bg);
      setBookingStyle(emp.pg_estilo);

      const empresaId = emp.id;

      const { data: srv } = await supabase
        .from('servicos')
        .select('*')
        .eq('empresa_id', empresaId);

      const { data: ag } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('empresa_id', empresaId);

      const { data: dias } = await supabase
        .from('dias_semanais')
        .select('*')
        .eq('empresa_id', empresaId);

      setServices(srv || []);
      setAppointments(ag || []);
      setDiasSemana(dias || []);
    }

    load();
  }, [slug]);*/

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/booking?slug=${slug}`);
      const data = await res.json();

      setEmpresa(data.empresa);
      setServices(data.servicos);
      setDiasSemana(data.dias);
      setAppointments(data.agendamentos);

      setLogo(data.empresa.logo);
      setExtraImage(data.empresa.bg);
      setBookingStyle(data.empresa.estilo);
    }

    load();
  }, [slug]);

  const service = services.find(s => s.id === selectedService);

  // 🔥 DATAS DISPONÍVEIS
  const dates = useMemo(() => {
    if (!empresa) return [];

    const result: Date[] = [];
    const now = new Date();

    for (let i = 1; i <= empresa.max_agenda_dias; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);

      const dateStr = d.toISOString().split('T')[0];
      const day = getDayOfWeek(dateStr);

      const config = diasSemana.find(ds => ds.dia_semana === day);

      if (!config) continue;

      result.push(d);
    }

    return result;
  }, [empresa, diasSemana]);

  // 🔥 HORÁRIOS DISPONÍVEIS
  const availableSlots = useMemo(() => {
    if (!selectedDate || !service || !empresa) return [];

    const day = getDayOfWeek(selectedDate);
    const config = diasSemana.find(d => d.dia_semana === day);

    if (!config) return [];

    const start = timeToMinutes(config.hora_inicio);
    const end = timeToMinutes(config.hora_fim);
    const slot = Number(config.slot_minimo);

    const now = new Date();
    const minTime = new Date(now.getTime() + empresa.min_pre_hora * 60 * 60 * 1000);

    const result: string[] = [];

    for (let m = start; m < end; m += slot) {
      const time = minutesToTime(m);

      const fullDate = new Date(`${selectedDate}T${time}:00`);

      // 🔥 REGRA ANTECEDÊNCIA
      if (fullDate < minTime) continue;

      const slotStart = m;
      const slotEnd = m + service.duracao;

      const sameDayAppointments = appointments.filter(a => {
        const d = new Date(a.data_hora);
        return d.toISOString().split('T')[0] === selectedDate;
      });

      const overlapping = sameDayAppointments.filter(a => {
        const d = new Date(a.data_hora);
        const aStart = timeToMinutes(d.toTimeString().slice(0, 5));
        const aEnd = aStart + (a.duracao ?? 30);

        return slotStart < aEnd && slotEnd > aStart;
      });

      // 🔥 LIMITE DIA
      if (overlapping.length >= config.serv_simultaneo) continue;

      // 🔥 LIMITE SERVIÇO
      const sameService = overlapping.filter(a => a.servico_id === service.id);

      if (sameService.length >= service.simultaneo) continue;

      result.push(time);
    }

    return result;
  }, [selectedDate, service, appointments, diasSemana, empresa]);

  // 🔥 CONFIRMAR
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!service || !empresa) return;

    const dataHora = new Date(`${selectedDate}T${selectedTime}:00`);

    await supabase.from('agendamentos').insert({
      empresa_id: empresa.id,
      cliente_nome: name,
      cliente_telefone: phone,
      cliente_email: email,
      servico_id: service.id,
      data_hora: dataHora.toISOString(),
    });

    toast.success(t('bookingConfirmed'));
    setStep('done');
  };

  const reset = () => {
    setStep('service');
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setName('');
    setPhone('');
    setEmail('');
  };

  return {
    slug,
    logo,
    extraImage,
    bookingStyle,
    businessEmail: empresa?.email || '',
    businessPhone: empresa?.telefone || '',
    businessAddress: empresa?.endereco || '',
    step,
    setStep,
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    service,
    mockServices: services, // 🔥 agora é real
    availableSlots,
    dates,
    handleConfirm,
    reset,
    t,
    locale,
  };
}