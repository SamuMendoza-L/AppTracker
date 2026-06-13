# Plan Maestro · Progreso

Aplicación Next.js (App Router) para llevar el seguimiento del plan de
productividad: checklist diario, distribución de horas semanales, objetivos
personalizados con checklist por día de la semana, revisión semanal y
progreso acumulado histórico. Todo se guarda en Supabase, por lo que el
progreso persiste entre dispositivos y sesiones.

## Stack

- Next.js 15 (App Router, TypeScript)
- Supabase (Postgres + API REST vía `@supabase/supabase-js`)
- CSS plano (dark, minimalista) en `src/app/globals.css`
- Despliegue recomendado: Vercel

## 1. Configurar Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor > New query**, pega el contenido de
   `supabase/schema.sql` y ejecútalo. Esto crea todas las tablas:
   - `checklist_status`
   - `goals`
   - `goal_status`
   - `hours_log`
   - `weekly_reviews`
   - `weekly_progress_snapshots` (progreso acumulado)
3. Ve a **Project Settings > API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 4. Desplegar en Vercel

1. Sube este proyecto a un repo de GitHub/GitLab/Bitbucket.
2. En [vercel.com](https://vercel.com), importa el repo.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Cada vez que entres a la URL de Vercel verás tu progreso
   guardado, sin importar el dispositivo.

## Funcionalidades

### Resumen
Progreso de hoy, promedio semanal del checklist base, promedio de objetivos
personalizados y racha de días con +50% completado.

### Checklist diario
Horario base lunes-jueves y mínimos obligatorios para viernes/sábado/domingo
(editable en `src/lib/constants.ts`). El estado se guarda en
`checklist_status`, asociado a la semana actual (`week_start`, lunes en
formato `YYYY-MM-DD`).

### Distribución semanal
Registro de horas por área comparado contra las metas semanales sugeridas
(`WEEKLY_HOURS_TARGET` en `src/lib/constants.ts`). Se guarda en `hours_log`.

### Objetivos personalizados
Crea objetivos con:
- Nombre
- Días de la semana en los que aplica (lunes a domingo, selección múltiple)
- Una lista de tareas que forman su checklist propio

Cada combinación (objetivo, semana, día, tarea) se guarda en `goal_status`.
El progreso del objetivo es `tareas completadas / tareas totales` sumando
todos los días asignados de la semana actual.

### Revisión semanal
Preguntas guía del domingo (programación, portafolio, MOVRA, clientes,
inglés), guardadas en `weekly_reviews` (una fila por semana, `upsert`).

### Progreso acumulado
Cada vez que la app detecta que la semana anterior no tiene un registro en
`weekly_progress_snapshots`, genera automáticamente uno con:
- `checklist_avg`: % promedio del checklist base de esa semana
- `goals_avg`: % promedio de objetivos personalizados
- `hours_total` / `hours_target`: horas registradas vs meta
- `details`: desglose por día y por área (JSON)

Esto ocurre la primera vez que abres la app después de que termine una
semana (por ejemplo, el lunes siguiente), no requiere un cron job.

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # Página principal, maneja las tabs
│   └── globals.css        # Estilos dark minimalista
├── components/
│   ├── ResumenView.tsx
│   ├── ChecklistView.tsx
│   ├── SemanalView.tsx
│   ├── ObjetivosView.tsx
│   ├── RevisionView.tsx
│   └── AcumuladoView.tsx
└── lib/
    ├── constants.ts       # Horarios, tareas, metas de horas
    ├── supabaseClient.ts  # Cliente de Supabase
    ├── types.ts           # Tipos de las tablas
    └── useProgressData.ts # Hook con toda la lógica de datos
supabase/
└── schema.sql             # Script para crear las tablas en Supabase
```

## Personalización

- **Horarios y tareas base**: `WEEKDAY_TASKS` y `WEEKEND_TASKS` en
  `src/lib/constants.ts`.
- **Metas de horas semanales**: `WEEKLY_HOURS_TARGET`.
- **Colores / estilo**: variables CSS al inicio de `src/app/globals.css`
  (`:root { ... }`).
