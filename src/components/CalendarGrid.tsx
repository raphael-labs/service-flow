import { useMemo } from 'react';
import type { Appointment } from '@/types';
import { User, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CalendarGridProps {
  date: string;
  appointments: Appointment[];
  startHour?: number;
  endHour?: number;
  onSlotClick: (time: string) => void;
}

const SLOT_HEIGHT = 48;
const PX_PER_MINUTE = SLOT_HEIGHT / 30;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-primary/15 border-primary/30 text-primary',
  pending: 'bg-warning/15 border-warning/30 text-warning-foreground',
  cancelled: 'bg-destructive/10 border-destructive/20 text-destructive',
};

export function hasOverlap(
  newStart: string,
  newDuration: number,
  existingAppointments: Appointment[],
  excludeId?: string
): boolean {
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = newStartMin + newDuration;

  return existingAppointments.some(a => {
    if (excludeId && a.id === excludeId) return false;
    const aStart = timeToMinutes(a.time);
    const aEnd = aStart + a.duration;
    return newStartMin < aEnd && newEndMin > aStart;
  });
}

export default function CalendarGrid({ date, appointments, startHour = 8, endHour = 18, onSlotClick }: CalendarGridProps) {
  const { t } = useTranslation();

  const dayAppointments = useMemo(
    () => appointments.filter(a => a.date === date && a.status !== 'cancelled'),
    [appointments, date]
  );

  const slots = useMemo(() => {
    const result: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      result.push(`${String(h).padStart(2, '0')}:00`);
      result.push(`${String(h).padStart(2, '0')}:30`);
    }
    return result;
  }, [startHour, endHour]);

  const startMinutes = startHour * 60;
  const totalMinutes = (endHour - startHour) * 60;
  const totalHeight = totalMinutes * PX_PER_MINUTE;

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-14 relative" style={{ height: totalHeight }}>
        {slots.map(time => {
          const top = (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;
          return (
            <div
              key={time}
              className="absolute right-2 text-xs text-muted-foreground font-medium"
              style={{ top }}
            >
              {time}
            </div>
          );
        })}
      </div>

      <div className="flex-1 relative" style={{ height: totalHeight }}>
        {slots.map(time => {
          const top = (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;
          const isHour = time.endsWith(':00');
          return (
            <div
              key={time}
              className={`absolute left-0 right-0 border-t ${isHour ? 'border-border' : 'border-border/40'}`}
              style={{ top }}
            />
          );
        })}

        {slots.map(time => {
          const top = (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;
          return (
            <div
              key={`click-${time}`}
              className="absolute left-0 right-0 cursor-pointer hover:bg-accent/40 transition-colors z-0 group"
              style={{ top, height: SLOT_HEIGHT }}
              onClick={() => onSlotClick(time)}
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {t('newAppointmentSlot')}
              </span>
            </div>
          );
        })}

        {dayAppointments.map(a => {
          const topOffset = (timeToMinutes(a.time) - startMinutes) * PX_PER_MINUTE;
          const height = Math.max(a.duration * PX_PER_MINUTE, 28);
          const colorClass = statusColors[a.status] || statusColors.confirmed;
          const isCompact = a.duration <= 15;

          return (
            <div
              key={a.id}
              className={`absolute left-1 right-1 rounded-lg border px-2.5 z-10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${colorClass}`}
              style={{ top: topOffset, height }}
              title={`${a.clientName} – ${a.serviceName} (${a.duration}min)`}
            >
              {isCompact ? (
                <div className="flex items-center gap-1.5 h-full">
                  <span className="text-[11px] font-medium truncate">{a.clientName}</span>
                  <span className="text-[10px] opacity-70 truncate">· {a.serviceName}</span>
                </div>
              ) : (
                <div className="py-1.5">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <User className="w-3 h-3 shrink-0" />
                    <span className="truncate">{a.clientName}</span>
                  </div>
                  <p className="text-[11px] opacity-70 truncate mt-0.5">{a.serviceName}</p>
                  {a.duration >= 30 && (
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-60">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{a.time} · {a.duration}min</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
