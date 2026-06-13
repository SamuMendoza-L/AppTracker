'use client';

import { useState } from 'react';
import { barClass, DAYS, DayName } from '@/lib/constants';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function ObjetivosView(props: Props) {
  const { goals, addGoal, removeGoal, toggleGoalTask, isGoalTaskDone, goalPercent } = props;

  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayName[]>([]);
  const [taskInputs, setTaskInputs] = useState<string[]>(['']);

  function toggleDay(day: DayName) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function updateTaskInput(i: number, value: string) {
    setTaskInputs((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function addTaskInput() {
    setTaskInputs((prev) => [...prev, '']);
  }

  function removeTaskInput(i: number) {
    setTaskInputs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const tasks = taskInputs.map((t) => t.trim()).filter(Boolean);

    if (!trimmedName || selectedDays.length === 0 || tasks.length === 0) return;

    addGoal(trimmedName, selectedDays, tasks);

    setName('');
    setSelectedDays([]);
    setTaskInputs(['']);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Agregar nuevo objetivo</div>

        <div className="goal-form">
          <input
            type="text"
            className="input"
            placeholder="Nombre del objetivo (ej: Curso de React)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
              Días de la semana asignados
            </div>
            <div className="day-toggle-group">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`day-toggle${selectedDays.includes(d) ? ' selected' : ''}`}
                  onClick={() => toggleDay(d)}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
              Tareas del checklist (se repiten cada día asignado)
            </div>
            {taskInputs.map((t, i) => (
              <div className="task-input-row" key={i}>
                <input
                  type="text"
                  className="input"
                  placeholder={`Tarea ${i + 1}`}
                  value={t}
                  onChange={(e) => updateTaskInput(i, e.target.value)}
                />
                {taskInputs.length > 1 && (
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => removeTaskInput(i)}
                    aria-label="Eliminar tarea"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline adv" onClick={addTaskInput}>
              + Agregar tarea
            </button>
          </div>

          <button className="btn" onClick={handleSubmit} style={{ marginTop: 4 }}>
            Crear objetivo
          </button>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="empty">
            No tienes objetivos agregados todavía. Crea uno arriba: dale un nombre, elige los
            días de la semana en los que aplica y define las tareas de su checklist.
          </div>
        </div>
      ) : (
        goals.map((g) => {
          const pct = goalPercent(g);
          return (
            <div className="goal-card" key={g.id}>
              <div className="goal-head">
                <div className="goal-name">{g.name}</div>
                <div className="goal-actions">
                  <button
                    className="btn-outline"
                    onClick={() => removeGoal(g.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="goal-meta">
                Días asignados: {g.days.join(', ')}
              </div>

              <div className="progress-bar" style={{ marginBottom: 12 }}>
                <div className={`progress-fill ${barClass(pct)}`} style={{ width: `${pct}%` }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
                {pct}% completado esta semana
              </div>

              {DAYS.filter((d) => g.days.includes(d)).map((day) => (
                <div key={day} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: 4,
                    }}
                  >
                    {day}
                  </div>
                  {g.tasks.map((t) => {
                    const done = isGoalTaskDone(g.id, day, t.id);
                    const id = `g_${g.id}_${day}_${t.id}`;
                    return (
                      <div className={`check-item${done ? ' done' : ''}`} key={id}>
                        <input
                          type="checkbox"
                          id={id}
                          checked={done}
                          onChange={(e) => toggleGoalTask(g.id, day, t.id, e.target.checked)}
                        />
                        <label htmlFor={id}>{t.label}</label>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
