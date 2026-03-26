export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  slug: string;
  address: string;
}

export type Currency = 'BRL' | 'USD' | 'EUR';

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price?: number;
  currency: Currency;
  simultaneousSlots: number; // how many can be booked at the same time
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface ScheduleConfig {
  daysOfWeek: number[]; // 0=Sun, 1=Mon...
  startTime: string;
  endTime: string;
  slotDuration: number; // minutes
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  email: string;
  address: string;
  schedule: ScheduleConfig;
}
