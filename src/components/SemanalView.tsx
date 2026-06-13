'use client';

import { useState } from 'react';
import { barClass, WEEKLY_HOURS_TARGET } from '@/lib/constants';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function SemanalView(props: Props) {
  const { hoursForArea, addHours, hoursTotal } = props;
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const targetTotal = Object.values(WEEKLY_HOURS_TARGET).reduce((a, b) => a + b, 0);

  function handleAdd(area: string) {
    const val = parseFloat(inputs[area]);
    if (!val || val <= 0) return;
    addHours(area, val);
    setInputs((prev) => ({ ...prev, [area]: '' }));
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          Distribución de horas semanales <small>meta vs registrado</small>
        </div>
        {Object.entries(WEEKLY_HOURS_TARGET).map(([area, target]) => {
          const logged = hoursForArea(area);
          const pct = Math.min(100, Math.round((logged / target) * 100));
          return (
            <div className="progress-row" key={area}>
              <div className="progress-label">
                <span>{area}</span>
                <span>
                  {logged}h / {target}h ({pct}%)
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${barClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        <div className="progress-row" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }}>
          <div className="progress-label">
            <span>Total semanal</span>
            <span>
              {hoursTotal}h / {targetTotal}h
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Registrar horas de hoy <small>por área</small>
        </div>
        {Object.keys(WEEKLY_HOURS_TARGET).map((area) => (
          <div className="hours-row" key={area}>
            <span className="area-label">{area}</span>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              className="input"
              value={inputs[area] ?? ''}
              onChange={(e) => setInputs((prev) => ({ ...prev, [area]: e.target.value }))}
            />
            <span className="unit">horas</span>
            <button className="btn-outline adv" onClick={() => handleAdd(area)}>
              + Agregar
            </button>
          </div>
        ))}
        <p className="hint">
          Las horas se acumulan a la semana actual (lunes a domingo) y se guardan
          automáticamente en Supabase.
        </p>
      </div>
    </div>
  );
}
