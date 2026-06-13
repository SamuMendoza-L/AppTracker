'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  DAYS,
  DayName,
  getTasksForDay,
  getTodayName,
  getWeekStartKey,
  WEEKLY_HOURS_TARGET,
  WEEKLY_HOURS_TARGET_TOTAL,
} from './constants';
import type {
  ChecklistStatusRow,
  GoalRow,
  GoalStatusRow,
  HoursLogRow,
  WeeklyReviewRow,
  WeeklySnapshotRow,
} from './types';

export function useProgressData() {
  const [weekStart, setWeekStart] = useState(() => getWeekStartKey());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checklist, setChecklist] = useState<ChecklistStatusRow[]>([]);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [goalStatus, setGoalStatus] = useState<GoalStatusRow[]>([]);
  const [hoursLog, setHoursLog] = useState<HoursLogRow[]>([]);
  const [reviews, setReviews] = useState<WeeklyReviewRow[]>([]);
  const [snapshots, setSnapshots] = useState<WeeklySnapshotRow[]>([]);

  // ------------------------------------------------------------
  // Carga inicial + revisión de cierre de semana
  // ------------------------------------------------------------
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentWeek = getWeekStartKey();
      setWeekStart(currentWeek);

      const [
        checklistRes,
        goalsRes,
        goalStatusRes,
        hoursRes,
        reviewsRes,
        snapshotsRes,
      ] = await Promise.all([
        supabase.from('checklist_status').select('*').eq('week_start', currentWeek),
        supabase.from('goals').select('*').order('created_at', { ascending: true }),
        supabase.from('goal_status').select('*').eq('week_start', currentWeek),
        supabase.from('hours_log').select('*').eq('week_start', currentWeek),
        supabase.from('weekly_reviews').select('*').order('week_start', { ascending: false }),
        supabase
          .from('weekly_progress_snapshots')
          .select('*')
          .order('week_start', { ascending: false }),
      ]);

      const firstError =
        checklistRes.error ||
        goalsRes.error ||
        goalStatusRes.error ||
        hoursRes.error ||
        reviewsRes.error ||
        snapshotsRes.error;

      if (firstError) throw firstError;

      setChecklist(checklistRes.data ?? []);
      setGoals((goalsRes.data ?? []) as unknown as GoalRow[]);
      setGoalStatus(goalStatusRes.data ?? []);
      setHoursLog(hoursRes.data ?? []);
      setReviews(reviewsRes.data ?? []);
      setSnapshots(snapshotsRes.data ?? []);

      // Si la semana anterior no tiene snapshot, lo generamos.
      await maybeCreatePreviousWeekSnapshot(snapshotsRes.data ?? []);
    } catch (err) {
      console.error(err);
      setError(
        'No se pudo conectar con Supabase. Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------
  // Genera snapshot de la semana pasada si no existe (cierre
  // automático de domingo).
  // ------------------------------------------------------------
  async function maybeCreatePreviousWeekSnapshot(existingSnapshots: WeeklySnapshotRow[]) {
    const currentWeek = getWeekStartKey();
    const prevWeekStart = new Date(currentWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekKey = prevWeekStart.toISOString().slice(0, 10);

    if (prevWeekKey === currentWeek) return; // edge case
    const already = existingSnapshots.some((s) => s.week_start === prevWeekKey);
    if (already) return;

    try {
      const [checklistRes, goalsRes, goalStatusRes, hoursRes] = await Promise.all([
        supabase.from('checklist_status').select('*').eq('week_start', prevWeekKey),
        supabase.from('goals').select('*'),
        supabase.from('goal_status').select('*').eq('week_start', prevWeekKey),
        supabase.from('hours_log').select('*').eq('week_start', prevWeekKey),
      ]);

      const prevChecklist = checklistRes.data ?? [];
      const prevGoals = (goalsRes.data ?? []) as unknown as GoalRow[];
      const prevGoalStatus = goalStatusRes.data ?? [];
      const prevHours = hoursRes.data ?? [];

      // Si no hay ningún dato de esa semana, no creamos snapshot vacío.
      if (
        prevChecklist.length === 0 &&
        prevGoalStatus.length === 0 &&
        prevHours.length === 0
      ) {
        return;
      }

      // Promedio checklist base (sobre 7 días x tareas correspondientes)
      let totalTasks = 0;
      let doneTasks = 0;
      DAYS.forEach((day) => {
        const tasks = getTasksForDay(day);
        totalTasks += tasks.length;
        tasks.forEach((_, i) => {
          const row = prevChecklist.find(
            (r) => r.day_name === day && r.task_index === i
          );
          if (row?.done) doneTasks += 1;
        });
      });
      const checklistAvg = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      // Promedio objetivos (sobre todas las tareas de objetivos asignadas
      // a algún día de esa semana)
      let goalTotal = 0;
      let goalDone = 0;
      prevGoals.forEach((g) => {
        g.days.forEach((day) => {
          g.tasks.forEach((t) => {
            goalTotal += 1;
            const row = prevGoalStatus.find(
              (r) => r.goal_id === g.id && r.day_name === day && r.task_id === t.id
            );
            if (row?.done) goalDone += 1;
          });
        });
      });
      const goalsAvg = goalTotal > 0 ? Math.round((goalDone / goalTotal) * 100) : 0;

      const hoursTotal = prevHours.reduce((acc, h) => acc + Number(h.hours), 0);

      const details: Record<string, unknown> = {
        byDay: DAYS.map((day) => {
          const tasks = getTasksForDay(day);
          const done = tasks.filter(
            (_, i) => prevChecklist.find((r) => r.day_name === day && r.task_index === i)?.done
          ).length;
          return {
            day,
            pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0,
          };
        }),
        byArea: Object.keys(WEEKLY_HOURS_TARGET).map((area) => ({
          area,
          hours: prevHours.find((h) => h.area === area)?.hours ?? 0,
          target: WEEKLY_HOURS_TARGET[area],
        })),
      };

      const { data, error: insertError } = await supabase
        .from('weekly_progress_snapshots')
        .insert({
          week_start: prevWeekKey,
          checklist_avg: checklistAvg,
          goals_avg: goalsAvg,
          hours_total: hoursTotal,
          hours_target: WEEKLY_HOURS_TARGET_TOTAL,
          details,
        })
        .select()
        .single();

      if (insertError) {
        // Puede fallar por condición de carrera (unique constraint);
        // no es crítico.
        console.warn('No se pudo crear snapshot automático:', insertError.message);
        return;
      }

      if (data) {
        setSnapshots((prev) => [data as WeeklySnapshotRow, ...prev]);
      }
    } catch (err) {
      console.warn('Error generando snapshot automático', err);
    }
  }

  // ------------------------------------------------------------
  // CHECKLIST BASE
  // ------------------------------------------------------------
  const toggleChecklistTask = useCallback(
    async (day: DayName, taskIndex: number, done: boolean) => {
      // Optimistic update
      setChecklist((prev) => {
        const existing = prev.find((r) => r.day_name === day && r.task_index === taskIndex);
        if (existing) {
          return prev.map((r) =>
            r.day_name === day && r.task_index === taskIndex ? { ...r, done } : r
          );
        }
        return [
          ...prev,
          {
            id: `temp-${day}-${taskIndex}`,
            week_start: weekStart,
            day_name: day,
            task_index: taskIndex,
            done,
          },
        ];
      });

      const { error: upsertError } = await supabase.from('checklist_status').upsert(
        {
          week_start: weekStart,
          day_name: day,
          task_index: taskIndex,
          done,
        },
        { onConflict: 'week_start,day_name,task_index' }
      );

      if (upsertError) {
        console.error(upsertError);
        setError('No se pudo guardar el cambio en Supabase.');
      }
    },
    [weekStart]
  );

  function isChecklistDone(day: DayName, taskIndex: number): boolean {
    return (
      checklist.find((r) => r.day_name === day && r.task_index === taskIndex)?.done ?? false
    );
  }

  function checklistDayPercent(day: DayName): number {
    const tasks = getTasksForDay(day);
    if (tasks.length === 0) return 0;
    const done = tasks.filter((_, i) => isChecklistDone(day, i)).length;
    return Math.round((done / tasks.length) * 100);
  }

  const checklistWeekAvg = useMemo(() => {
    const pcts = DAYS.map((d) => checklistDayPercent(d));
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist]);

  // ------------------------------------------------------------
  // OBJETIVOS PERSONALIZADOS
  // ------------------------------------------------------------
  const addGoal = useCallback(
    async (name: string, days: DayName[], taskLabels: string[]) => {
      const tasks = taskLabels
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label, i) => ({ id: `t${i + 1}_${Date.now()}`, label }));

      const { data, error: insertError } = await supabase
        .from('goals')
        .insert({ name, days, tasks })
        .select()
        .single();

      if (insertError) {
        console.error(insertError);
        setError('No se pudo crear el objetivo.');
        return;
      }
      if (data) {
        setGoals((prev) => [...prev, data as unknown as GoalRow]);
      }
    },
    []
  );

  const removeGoal = useCallback(async (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setGoalStatus((prev) => prev.filter((s) => s.goal_id !== goalId));

    const { error: deleteError } = await supabase.from('goals').delete().eq('id', goalId);
    if (deleteError) {
      console.error(deleteError);
      setError('No se pudo eliminar el objetivo.');
    }
  }, []);

  const toggleGoalTask = useCallback(
    async (goalId: string, day: DayName, taskId: string, done: boolean) => {
      setGoalStatus((prev) => {
        const existing = prev.find(
          (s) => s.goal_id === goalId && s.day_name === day && s.task_id === taskId
        );
        if (existing) {
          return prev.map((s) =>
            s.goal_id === goalId && s.day_name === day && s.task_id === taskId
              ? { ...s, done }
              : s
          );
        }
        return [
          ...prev,
          {
            id: `temp-${goalId}-${day}-${taskId}`,
            goal_id: goalId,
            week_start: weekStart,
            day_name: day,
            task_id: taskId,
            done,
          },
        ];
      });

      const { error: upsertError } = await supabase.from('goal_status').upsert(
        {
          goal_id: goalId,
          week_start: weekStart,
          day_name: day,
          task_id: taskId,
          done,
        },
        { onConflict: 'goal_id,week_start,day_name,task_id' }
      );

      if (upsertError) {
        console.error(upsertError);
        setError('No se pudo guardar el progreso del objetivo.');
      }
    },
    [weekStart]
  );

  function isGoalTaskDone(goalId: string, day: DayName, taskId: string): boolean {
    return (
      goalStatus.find(
        (s) => s.goal_id === goalId && s.day_name === day && s.task_id === taskId
      )?.done ?? false
    );
  }

  function goalPercent(goal: GoalRow): number {
    let total = 0;
    let done = 0;
    goal.days.forEach((day) => {
      goal.tasks.forEach((t) => {
        total += 1;
        if (isGoalTaskDone(goal.id, day, t.id)) done += 1;
      });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  const goalsAvg = useMemo(() => {
    if (goals.length === 0) return 0;
    const pcts = goals.map((g) => goalPercent(g));
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, goalStatus]);

  // ------------------------------------------------------------
  // HORAS SEMANALES
  // ------------------------------------------------------------
  const addHours = useCallback(
    async (area: string, hours: number) => {
      const current = hoursLog.find((h) => h.area === area)?.hours ?? 0;
      const newTotal = Number(current) + hours;

      setHoursLog((prev) => {
        const existing = prev.find((h) => h.area === area);
        if (existing) {
          return prev.map((h) => (h.area === area ? { ...h, hours: newTotal } : h));
        }
        return [
          ...prev,
          { id: `temp-${area}`, week_start: weekStart, area, hours: newTotal },
        ];
      });

      const { error: upsertError } = await supabase.from('hours_log').upsert(
        { week_start: weekStart, area, hours: newTotal },
        { onConflict: 'week_start,area' }
      );

      if (upsertError) {
        console.error(upsertError);
        setError('No se pudieron guardar las horas.');
      }
    },
    [hoursLog, weekStart]
  );

  function hoursForArea(area: string): number {
    return Number(hoursLog.find((h) => h.area === area)?.hours ?? 0);
  }

  const hoursTotal = useMemo(
    () => hoursLog.reduce((acc, h) => acc + Number(h.hours), 0),
    [hoursLog]
  );

  // ------------------------------------------------------------
  // REVISIÓN SEMANAL
  // ------------------------------------------------------------
  const saveReview = useCallback(
    async (fields: Omit<WeeklyReviewRow, 'id' | 'week_start' | 'created_at'>) => {
      const { data, error: upsertError } = await supabase
        .from('weekly_reviews')
        .upsert({ week_start: weekStart, ...fields }, { onConflict: 'week_start' })
        .select()
        .single();

      if (upsertError) {
        console.error(upsertError);
        setError('No se pudo guardar la revisión semanal.');
        return;
      }

      if (data) {
        setReviews((prev) => {
          const without = prev.filter((r) => r.week_start !== weekStart);
          return [data as WeeklyReviewRow, ...without].sort((a, b) =>
            b.week_start.localeCompare(a.week_start)
          );
        });
      }
    },
    [weekStart]
  );

  return {
    loading,
    error,
    weekStart,
    today: getTodayName(),
    reload: loadAll,

    // checklist
    checklist,
    isChecklistDone,
    checklistDayPercent,
    checklistWeekAvg,
    toggleChecklistTask,

    // goals
    goals,
    addGoal,
    removeGoal,
    toggleGoalTask,
    isGoalTaskDone,
    goalPercent,
    goalsAvg,

    // hours
    hoursLog,
    addHours,
    hoursForArea,
    hoursTotal,

    // reviews
    reviews,
    saveReview,

    // snapshots
    snapshots,
  };
}
