import { useMemo } from 'react';
import type { Appointment } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface CalendarGridProps {
  date: string;
  appointments: Appointment[];
  diasSemana?: any[];
  startHour?: number;
  endHour?: number;
  onSlotClick: (time: string) => void;
  onEdit?: (appointment: Appointment) => void;
}

// 🔥 PIXEL FIXO POR MINUTO (não depende do slot)
const PX_PER_MINUTE = 1.6;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function timeStringToMinutes(time?: string) {
  if (!time) return null;

  const parts = time.split(':');
  if (parts.length < 2) return null;

  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (isNaN(h) || isNaN(m)) return null;

  return h * 60 + m;
}

export default function CalendarGrid({
  date,
  appointments,
  diasSemana,
  startHour = 8,
  endHour = 18,
  onSlotClick,
  onEdit
}: CalendarGridProps) {
  const { t } = useTranslation();

  // 🔥 evita bug de timezone
  function getDayOfWeek(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
  }

  const dayOfWeek = getDayOfWeek(date);

  const dayConfig = diasSemana?.find(
    d => Number(d.dia_semana) === dayOfWeek
  );

  const isActiveDay = !!dayConfig;

  // 🔥 horários vindos do banco (TIME)
  const startMinutes =
    timeStringToMinutes(dayConfig?.hora_inicio) ?? startHour * 60;

  const endMinutes =
    timeStringToMinutes(dayConfig?.hora_fim) ?? endHour * 60;

  // 🔥 SLOT MÍNIMO (ESSENCIAL)
  const slot = Number(dayConfig?.slot_minimo ?? 30);

  // 🔥 altura total
  const totalMinutes = endMinutes - startMinutes;
  const totalHeight = totalMinutes * PX_PER_MINUTE;

  // 🔥 filtra apenas dia atual
  const dayAppointments = useMemo(
    () =>
      appointments.filter(
        a => a.date === date && a.status !== 'cancelled'
      ),
    [appointments, date]
  );

  // 🔥 gera slots baseado no slot_minuto
  const slots = useMemo(() => {
    const result: string[] = [];

    for (let m = startMinutes; m < endMinutes; m += slot) {
      const h = Math.floor(m / 60);
      const min = m % 60;

      result.push(
        `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      );
    }

    return result;
  }, [startMinutes, endMinutes, slot]);

  return (
    <div className="flex gap-3">

      {/* HORAS */}
      <div className="shrink-0 w-16 relative" style={{ height: totalHeight }}>
        {slots.map(time => {
          const top =
            (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;

          return (
            <div
              key={time}
              className="absolute right-2 text-xs text-muted-foreground"
              style={{ top }}
            >
              {time}
            </div>
          );
        })}
      </div>

      {/* GRID */}
      <div className="flex-1 relative" style={{ height: totalHeight }}>

        {/* LINHAS */}
        {slots.map(time => {
          const top =
            (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;

          return (
            <div
              key={time}
              className="absolute left-0 right-0 border-t border-border/40"
              style={{ top }}
            />
          );
        })}

        {/* CLICK SLOT */}
        {slots.map(time => {
          const top =
            (timeToMinutes(time) - startMinutes) * PX_PER_MINUTE;

          return (
            <div
              key={`click-${time}`}
              className={`absolute left-0 right-0 ${isActiveDay
                  ? 'cursor-pointer hover:bg-accent/40'
                  : 'cursor-not-allowed'
                }`}
              style={{ top, height: slot * PX_PER_MINUTE }}
              onClick={() => {
                if (!isActiveDay) return;
                onSlotClick(time);
              }}
            />
          );
        })}

        {/* 🔥 AGENDAMENTOS COM SIMULTANEIDADE */}
        {(() => {
          const sorted = [...dayAppointments].sort(
            (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
          );

          const columns: Appointment[][] = [];

          sorted.forEach(appt => {
            const start = timeToMinutes(appt.time);
            const end = start + (appt.duracao ?? slot);

            let placed = false;

            for (const col of columns) {
              const last = col[col.length - 1];
              const lastEnd =
                timeToMinutes(last.time) + (last.duracao ?? slot);

              if (start >= lastEnd) {
                col.push(appt);
                placed = true;
                break;
              }
            }

            if (!placed) columns.push([appt]);
          });

          //const totalCols = columns.length;

          const baseCols = Number(dayConfig?.serv_simultaneo ?? 1);
          const totalCols = Math.max(baseCols, columns.length);

          return columns.flatMap((col, colIndex) =>
            col.map(a => {
              const topOffset =
                (timeToMinutes(a.time) - startMinutes) *
                PX_PER_MINUTE;

              const duration = a.duracao ?? slot;

              const height = Math.max(
                duration * PX_PER_MINUTE,
                28
              );

              return (
                <div
                  key={a.id}
                  onClick={() => onEdit?.(a)}
                  className="absolute bg-primary/15 border border-primary/30 rounded-lg px-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{
                    top: topOffset,
                    height,
                    width: `calc(${95 / totalCols}% - 4px)`,
                    left: `calc(${(100 / totalCols) * colIndex}% + 2px)`
                  }}
                  title={`${a.clientName} – ${a.serviceName} (${a.duracao}min)`}
                >
                  <div className="text-xs font-medium truncate">
                    {a.clientName}
                  </div>
                  <div className="text-[11px] opacity-70 truncate">
                    {a.serviceName}
                  </div>

                  {duration >= 30 && (
                    <div className="text-[10px] opacity-60 mt-1">
                      {a.time} · {duration}min
                    </div>
                  )}
                </div>
              );
            })
          );
        })()}

        {/* 🔥 OVERLAY DIA INATIVO */}
        {!isActiveDay && (
          <div className="absolute inset-0 bg-muted/60 z-20 flex items-center justify-center text-sm font-medium text-muted-foreground">
            🚫 Dia indisponível
          </div>
        )}
      </div>
    </div>
  );
}