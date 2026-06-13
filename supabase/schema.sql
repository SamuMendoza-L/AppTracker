-- ============================================================
-- Plan Maestro · Progreso — Schema de Supabase
-- ============================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto
-- de Supabase (Project > SQL Editor > New query > Run).
-- ============================================================

-- Habilita la extensión para UUIDs (normalmente ya viene activa)
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. checklist_status
-- Estado (hecho / no hecho) de cada tarea del checklist base,
-- por semana y por día.
-- ------------------------------------------------------------
create table if not exists checklist_status (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,           -- lunes de la semana (YYYY-MM-DD)
  day_name text not null,             -- 'Lunes'..'Domingo'
  task_index int not null,            -- índice de la tarea en el array base
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (week_start, day_name, task_index)
);

-- ------------------------------------------------------------
-- 2. goals
-- Objetivos personalizados, asignados a uno o más días de la
-- semana, cada uno con su propio checklist.
-- ------------------------------------------------------------
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  days text[] not null default '{}', -- ej: ['Lunes','Miércoles','Viernes']
  tasks jsonb not null default '[]', -- ej: [{"id":"t1","label":"Repasar tema X"}]
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. goal_status
-- Estado (hecho / no hecho) de cada tarea de cada objetivo,
-- por semana, día y tarea.
-- ------------------------------------------------------------
create table if not exists goal_status (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references goals(id) on delete cascade,
  week_start date not null,
  day_name text not null,
  task_id text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (goal_id, week_start, day_name, task_id)
);

-- ------------------------------------------------------------
-- 4. hours_log
-- Horas registradas por área, por semana.
-- ------------------------------------------------------------
create table if not exists hours_log (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null,
  area text not null,
  hours numeric not null default 0,
  unique (week_start, area)
);

-- ------------------------------------------------------------
-- 5. weekly_reviews
-- Revisión del domingo (preguntas guía).
-- ------------------------------------------------------------
create table if not exists weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null unique,
  prog text default '',
  portafolio text default '',
  movra text default '',
  clientes text default '',
  ingles text default '',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. weekly_progress_snapshots ("Progreso acumulado")
-- Se genera automáticamente cada domingo (o al cerrar la
-- semana) con el resumen final de esa semana.
-- ------------------------------------------------------------
create table if not exists weekly_progress_snapshots (
  id uuid primary key default uuid_generate_v4(),
  week_start date not null unique,
  checklist_avg numeric not null default 0,   -- % promedio del checklist base
  goals_avg numeric not null default 0,       -- % promedio de objetivos
  hours_total numeric not null default 0,     -- horas totales registradas
  hours_target numeric not null default 0,    -- meta total de horas
  details jsonb not null default '{}',        -- desglose libre (por día, por área, etc.)
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
-- Esta app está pensada para uso personal (single user) sin
-- login. Para simplificar, se habilita RLS pero con una
-- política abierta usando la clave "anon". Si en el futuro
-- agregas autenticación, reemplaza estas políticas por reglas
-- basadas en auth.uid().
-- ------------------------------------------------------------

alter table checklist_status enable row level security;
alter table goals enable row level security;
alter table goal_status enable row level security;
alter table hours_log enable row level security;
alter table weekly_reviews enable row level security;
alter table weekly_progress_snapshots enable row level security;

create policy "allow all - checklist_status" on checklist_status
  for all using (true) with check (true);

create policy "allow all - goals" on goals
  for all using (true) with check (true);

create policy "allow all - goal_status" on goal_status
  for all using (true) with check (true);

create policy "allow all - hours_log" on hours_log
  for all using (true) with check (true);

create policy "allow all - weekly_reviews" on weekly_reviews
  for all using (true) with check (true);

create policy "allow all - weekly_progress_snapshots" on weekly_progress_snapshots
  for all using (true) with check (true);
