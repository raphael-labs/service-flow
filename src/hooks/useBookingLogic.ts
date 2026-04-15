import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useBusinessImageStore } from '@/stores/businessImageStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { BookingStyle } from '@/stores/businessImageStore';

function mapStyle(styleNumber?: number): BookingStyle {
  const map: Record<number, BookingStyle> = {
    1: 'classic',
    2: 'minimal',
    3: 'bold',
    4: 'elegant',
    5: 'compact',
    6: 'glass',
    7: 'playful',
    8: 'corporate',
    9: 'modern',
    10: 'warm',
  };

  return map[styleNumber || 1] || 'classic';
}

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
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 🔥 LOAD API
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/booking?slug=${slug}`);
        const data = await res.json();

        if (!data?.empresa) {
          console.error('Empresa não encontrada');
          setLoading(false);
          return;
        }

        const emp = data.empresa;

        setEmpresa(emp);
        setServices(data.servicos || []);
        setDiasSemana(data.dias || []);
        setAppointments(data.agendamentos || []);

        // 🔥 CORRETO (usa emp, não estado)
        setLogo(emp.path_img_logo || null);
        setExtraImage(emp.path_img_bg || null);
        setBookingStyle(mapStyle(emp.pg_estilo));

      } catch (err) {
        console.error('Erro ao carregar booking:', err);
      } finally {
        setLoading(false);
      }
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

      if (overlapping.length >= config.serv_simultaneo) continue;

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

  // 🔥 🔥 🔥 PROTEÇÃO PRINCIPAL
  if (loading || !empresa) {
    return { loading: true };
  }

  return {
    loading: false,
    slug,
    logo,
    extraImage,
    bookingStyle, // 🔥 AGORA VEM DO STORE (correto)
    businessEmail: empresa.email || '',
    businessPhone: empresa.telefone || '',
    businessAddress: empresa.endereco || '',
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
    mockServices: services,
    availableSlots,
    dates,
    handleConfirm,
    reset,
    t,
    locale,
  };
}