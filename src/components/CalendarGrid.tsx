import { useMemo } from 'react';
import type { Appointment } from '@/types';
import AppointmentCard from './AppointmentCard';

interface CalendarGridProps {
  date: string;
  appointments: Appointment[];
  startHour?: number;
  endHour?: number;
  onSlotClick: (time: string) => void;
}

export default function CalendarGrid({ date, appointments, startHour = 8, endHour = 18, onSlotClick }: CalendarGridProps) {
  const slots = useMemo(() => {
    const result: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      result.push(`${String(h).padStart(2, '0')}:00`);
      result.push(`${String(h).padStart(2, '0')}:30`);
    }
    return result;
  }, [startHour, endHour]);

  const getAppointmentForSlot = (time: string) =>
    appointments.filter(a => a.date === date && a.time === time);

  return (
    <div className="space-y-0.5">
      {slots.map(time => {
        const slotAppointments = getAppointmentForSlot(time);
        return (
          <div
            key={time}
            className="flex items-stretch gap-3 min-h-[52px] group"
          >
            <div className="w-14 shrink-0 text-xs text-muted-foreground pt-2 text-right pr-2 font-medium">
              {time}
            </div>
            <div
              className="flex-1 rounded-lg border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all cursor-pointer px-2 py-1 flex items-center gap-2"
              onClick={() => onSlotClick(time)}
            >
              {slotAppointments.length > 0 ? (
                <div className="flex gap-2 flex-wrap flex-1">
                  {slotAppointments.map(a => (
                    <div key={a.id} className="flex-1 min-w-[200px]">
                      <AppointmentCard appointment={a} />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  + Novo agendamento
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
