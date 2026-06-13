import type { DayName } from './constants';

export interface ChecklistStatusRow {
  id: string;
  week_start: string;
  day_name: DayName;
  task_index: number;
  done: boolean;
}

export interface GoalTask {
  id: string;
  label: string;
}

export interface GoalRow {
  id: string;
  name: string;
  days: DayName[];
  tasks: GoalTask[];
  created_at: string;
}

export interface GoalStatusRow {
  id: string;
  goal_id: string;
  week_start: string;
  day_name: DayName;
  task_id: string;
  done: boolean;
}

export interface HoursLogRow {
  id: string;
  week_start: string;
  area: string;
  hours: number;
}

export interface WeeklyReviewRow {
  id: string;
  week_start: string;
  prog: string;
  portafolio: string;
  movra: string;
  clientes: string;
  ingles: string;
  created_at: string;
}

export interface WeeklySnapshotRow {
  id: string;
  week_start: string;
  checklist_avg: number;
  goals_avg: number;
  hours_total: number;
  hours_target: number;
  details: Record<string, unknown>;
  created_at: string;
}
