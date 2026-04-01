import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessImageStore } from '@/stores/businessImageStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Currency } from '@/types';

export type Step = 'service' | 'datetime' | 'info' | 'done';

export interface MockService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  currency: Currency;
  simultaneousSlots: number;
}

const mockServices: MockService[] = [
  { id: '1', name: 'Corte de Cabelo', description: 'Corte masculino moderno com acabamento perfeito', duration: 30, price: 45, currency: 'BRL', simultaneousSlots: 1 },
  { id: '2', name: 'Barba', description: 'Barba feita com navalha e toalha quente', duration: 30, price: 30, currency: 'BRL', simultaneousSlots: 1 },
  { id: '3', name: 'Corte + Barba', description: 'Combo completo de corte e barba', duration: 60, price: 65, currency: 'BRL', simultaneousSlots: 1 },
  { id: '4', name: 'Hidratação', description: 'Tratamento capilar com hidratação profunda', duration: 45, price: 55, currency: 'BRL', simultaneousSlots: 1 },
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

export function formatCurrency(currency: Currency) {
  return currency === 'USD' ? 'US$' : currency === 'EUR' ? '€' : 'R$';
}

export function useBookingLogic() {
  const { slug } = useParams();
  const { appointments, addAppointment } = useAppointmentStore();
  const { logo, extraImage, bookingStyle } = useBusinessImageStore();
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { t, locale } = useTranslation();

  const service = mockServices.find(s => s.id === selectedService);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !service) return allSlots;
    const dayAppointments = appointments.filter(a => a.date === selectedDate && a.status !== 'cancelled');
    return allSlots.filter(time => !slotConflicts(time, service.duration, dayAppointments));
  }, [selectedDate, service, appointments]);

  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) result.push(d);
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
    toast.success(t('bookingConfirmed'));
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
    slug, logo, extraImage, bookingStyle,
    step, setStep,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    name, setName,
    phone, setPhone,
    email, setEmail,
    service, mockServices, availableSlots, dates,
    handleConfirm, reset,
    t, locale,
  };
}
