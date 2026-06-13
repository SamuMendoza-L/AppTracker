'use client';

import { barClass } from '@/lib/constants';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function AcumuladoView(props: Props) {
  const { snapshots } = props;

  if (snapshots.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Progreso acumulado</div>
        <div className="empty">
          Aún no hay semanas cerradas. Cada domingo (al pasar a la siguiente semana), la app
          guarda automáticamente un resumen de tu progreso aquí.
        </div>
      </div>
    );
  }

  const checklistAvgAll = Math.round(
    snapshots.reduce((acc, s) => acc + Number(s.checklist_avg), 0) / snapshots.length
  );
  const goalsAvgAll = Math.round(
    snapshots.reduce((acc, s) => acc + Number(s.goals_avg), 0) / snapshots.length
  );
  const hoursTotalAll = snapshots.reduce((acc, s) => acc + Number(s.hours_total), 0);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat">
          <div className="num">{snapshots.length}</div>
          <div className="lbl">Semanas registradas</div>
        </div>
        <div className="stat">
          <div className="num">{checklistAvgAll}%</div>
          <div className="lbl">Checklist promedio</div>
        </div>
        <div className="stat">
          <div className="num">{goalsAvgAll}%</div>
          <div className="lbl">Objetivos promedio</div>
        </div>
        <div className="stat">
          <div className="num">{Math.round(hoursTotalAll)}h</div>
          <div className="lbl">Horas totales</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Historial semanal <small>generado automáticamente cada domingo</small>
        </div>
        {snapshots.map((s) => {
          const hoursPct =
            s.hours_target > 0
              ? Math.min(100, Math.round((Number(s.hours_total) / Number(s.hours_target)) * 100))
              : 0;
          return (
            <div className="snapshot-item" key={s.id}>
              <div className="snapshot-date">Semana del {s.week_start}</div>

              <div className="progress-row">
                <div className="progress-label">
                  <span>Checklist diario</span>
                  <span>{s.checklist_avg}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${barClass(Number(s.checklist_avg))}`}
                    style={{ width: `${s.checklist_avg}%` }}
                  />
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  <span>Objetivos personalizados</span>
                  <span>{s.goals_avg}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${barClass(Number(s.goals_avg))}`}
                    style={{ width: `${s.goals_avg}%` }}
                  />
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  <span>Horas registradas</span>
                  <span>
                    {s.hours_total}h / {s.hours_target}h ({hoursPct}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${barClass(hoursPct)}`}
                    style={{ width: `${hoursPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
