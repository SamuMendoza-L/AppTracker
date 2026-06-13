'use client';

import { useState } from 'react';
import { DAYS, DayName, barClass, getTasksForDay, getTodayName } from '@/lib/constants';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function ChecklistView(props: Props) {
  const { isChecklistDone, checklistDayPercent, toggleChecklistTask } = props;
  const [day, setDay] = useState<DayName>(getTodayName());

  const isWeekend = day === 'Viernes' || day === 'Sábado' || day === 'Domingo';
  const tasks = getTasksForDay(day);
  const pct = checklistDayPercent(day);

  return (
    <div>
      <div className="card">
        <div className="card-title">
          Día activo
          <small>{isWeekend ? 'Día de trabajo (mínimos obligatorios)' : 'Día base'}</small>
        </div>
        <select
          className="select"
          value={day}
          onChange={(e) => setDay(e.target.value as DayName)}
          style={{ marginBottom: 14 }}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="progress-row">
          <div className="progress-label">
            <span>Progreso de este día</span>
            <span>{pct}%</span>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill ${barClass(pct)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Tareas <small>marca lo completado</small>
        </div>
        {tasks.map((t, i) => {
          const done = isChecklistDone(day, i);
          const id = `t_${day}_${i}`;
          return (
            <div className={`check-item${done ? ' done' : ''}`} key={id}>
              <input
                type="checkbox"
                id={id}
                checked={done}
                onChange={(e) => toggleChecklistTask(day, i, e.target.checked)}
              />
              <label htmlFor={id}>
                <span className="time-badge">{t.time}</span>
                {t.task}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
