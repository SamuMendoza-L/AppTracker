'use client';

import { DAYS } from '@/lib/constants';
import { barClass } from '@/lib/constants';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function ResumenView(props: Props) {
  const {
    today,
    checklistDayPercent,
    checklistWeekAvg,
    goals,
    goalPercent,
    goalsAvg,
  } = props;

  const racha = DAYS.filter((d) => checklistDayPercent(d) >= 50).length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat">
          <div className="num">{checklistDayPercent(today)}%</div>
          <div className="lbl">Progreso de hoy</div>
        </div>
        <div className="stat">
          <div className="num">{checklistWeekAvg}%</div>
          <div className="lbl">Promedio semanal</div>
        </div>
        <div className="stat">
          <div className="num">{goalsAvg}%</div>
          <div className="lbl">Objetivos promedio</div>
        </div>
        <div className="stat">
          <div className="num">{racha}</div>
          <div className="lbl">Días con +50%</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Progreso semanal por día <small>checklist diario</small>
        </div>
        {DAYS.map((d) => {
          const pct = checklistDayPercent(d);
          return (
            <div className="progress-row" key={d}>
              <div className="progress-label">
                <span>{d}</span>
                <span>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${barClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">
          Objetivos personalizados <small>según checklist por día</small>
        </div>
        {goals.length === 0 ? (
          <div className="empty">
            Aún no has agregado objetivos. Ve a la pestaña &quot;Objetivos personalizados&quot;.
          </div>
        ) : (
          goals.map((g) => {
            const pct = goalPercent(g);
            return (
              <div className="progress-row" key={g.id}>
                <div className="progress-label">
                  <span>
                    {g.name}{' '}
                    <span className="pill">{g.days.length} día(s)/semana</span>
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${barClass(pct)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
