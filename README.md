# Plan Maestro · Progreso

Landing page minimalista (dark mode) para llevar seguimiento del plan de
productividad: checklist diario, distribución de horas semanales, objetivos
personalizados con progreso por días, y revisión semanal tipo retro.

## Estructura

```
progreso-tracker/
├── index.html   # Estructura de la página
├── styles.css   # Estilos (dark, minimalista)
├── app.js       # Lógica de la aplicación
└── README.md
```

## Cómo usarlo

Solo abre `index.html` en el navegador. No requiere build ni dependencias.

## Secciones

- **Resumen**: progreso de hoy, promedio semanal, promedio de objetivos y
  racha de días con +50% completado.
- **Checklist diario**: horario lunes-jueves y mínimos obligatorios para
  viernes/sábado/domingo, con barra de progreso por día.
- **Distribución semanal**: registro de horas por área comparado contra las
  metas semanales sugeridas.
- **Objetivos personalizados**: agrega objetivos con nombre, días totales y
  día actual; el progreso se calcula como `currentDay / totalDays`.
- **Revisión semanal**: preguntas guía del domingo con historial.

## Persistencia de datos

⚠️ Actualmente el estado vive solo en memoria (`state` en `app.js`) y se
pierde al recargar la página. Para hacerlo persistente, opciones recomendadas:

1. **localStorage** (más simple, solo cliente): guardar/leer `state` como
   JSON en `localStorage` cada vez que cambie.
2. **Backend propio** (Node/Express + DB, Supabase, etc.): exponer
   endpoints para guardar y recuperar el `state` por usuario.
3. **Exportar/Importar JSON**: agregar botones para descargar el estado
   actual como archivo `.json` y volver a cargarlo después.

## Personalización

- **Horarios y tareas**: edita los arrays `WEEKDAY_TASKS` y `WEEKEND_TASKS`
  en `app.js`.
- **Metas de horas semanales**: edita el objeto `WEEKLY_HOURS_TARGET`.
- **Colores / estilo**: variables CSS al inicio de `styles.css`
  (`:root { ... }`).
