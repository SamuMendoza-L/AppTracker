export const DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type DayName = (typeof DAYS)[number];

export interface BaseTask {
  time: string;
  task: string;
}

// Tareas base lunes-jueves
export const WEEKDAY_TASKS: BaseTask[] = [
  { time: '08:00-08:30', task: 'Levantarse, desayuno, planificación del día' },
  { time: '08:30-11:30', task: 'Curso de programación / práctica técnica' },
  { time: '11:30-12:00', task: 'Descanso' },
  { time: '12:00-13:30', task: 'Portafolio web' },
  { time: '13:30-14:30', task: 'Almuerzo' },
  { time: '14:30-15:30', task: 'Inglés' },
  { time: '15:30-17:30', task: 'MOVRA POD' },
  { time: '17:30-18:00', task: 'Descanso' },
  { time: '18:00-19:00', task: 'Búsqueda de clientes / networking' },
  { time: '19:00-20:00', task: 'Cena' },
  { time: '20:00-21:30', task: 'Inglés / lectura técnica / revisar GitHub' },
  { time: '21:30-23:00', task: 'Tiempo libre / lectura / relajación' },
];

// Tareas mínimas obligatorias para días de trabajo (viernes-domingo)
export const WEEKEND_TASKS: BaseTask[] = [
  { time: '1h', task: 'Inglés' },
  { time: '1h', task: 'MOVRA' },
  { time: '30min', task: 'Prospección de clientes' },
  { time: '1h', task: 'Curso de programación' },
  { time: '15min', task: 'Organización del día siguiente' },
];

export function getTasksForDay(day: DayName): BaseTask[] {
  const isWeekend = day === 'Viernes' || day === 'Sábado' || day === 'Domingo';
  return isWeekend ? WEEKEND_TASKS : WEEKDAY_TASKS;
}

// Metas de horas semanales por área (promedio del rango sugerido)
export const WEEKLY_HOURS_TARGET: Record<string, number> = {
  'Cursos de programación': 19,
  Portafolio: 9,
  MOVRA: 10.5,
  Inglés: 7,
  'Prospección de clientes': 5.5,
  'Organización y revisión': 2,
};

export const WEEKLY_HOURS_TARGET_TOTAL = Object.values(WEEKLY_HOURS_TARGET).reduce(
  (a, b) => a + b,
  0
);

/** Devuelve la fecha (YYYY-MM-DD) del lunes de la semana actual. */
export function getWeekStartKey(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo ... 6 = sábado
  const diff = (day === 0 ? -6 : 1) - day; // ajusta para que la semana inicie en lunes
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

/** Índice 0-6 (lunes=0 ... domingo=6) del día de hoy. */
export function getTodayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

export function getTodayName(date: Date = new Date()): DayName {
  return DAYS[getTodayIndex(date)];
}

export function barClass(pct: number): string {
  if (pct < 40) return 'bar-red';
  if (pct < 80) return 'bar-amber';
  return 'bar-green';
}
