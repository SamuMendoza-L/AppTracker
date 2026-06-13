// ====== CONFIGURACIÓN BASE ======
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

// Tareas base lunes-jueves
const WEEKDAY_TASKS = [
  {time:'08:00-08:30', task:'Levantarse, desayuno, planificación del día'},
  {time:'08:30-11:30', task:'Curso de programación / práctica técnica'},
  {time:'11:30-12:00', task:'Descanso'},
  {time:'12:00-13:30', task:'Portafolio web'},
  {time:'13:30-14:30', task:'Almuerzo'},
  {time:'14:30-15:30', task:'Inglés'},
  {time:'15:30-17:30', task:'MOVRA POD'},
  {time:'17:30-18:00', task:'Descanso'},
  {time:'18:00-19:00', task:'Búsqueda de clientes / networking'},
  {time:'19:00-20:00', task:'Cena'},
  {time:'20:00-21:30', task:'Inglés / lectura técnica / revisar GitHub'},
  {time:'21:30-23:00', task:'Tiempo libre / lectura / relajación'},
];

// Tareas mínimas fin de semana (viernes, sábado, domingo)
const WEEKEND_TASKS = [
  {time:'1h', task:'Inglés'},
  {time:'1h', task:'MOVRA'},
  {time:'30min', task:'Prospección de clientes'},
  {time:'1h', task:'Curso de programación'},
  {time:'15min', task:'Organización del día siguiente'},
];

// Metas de horas semanales por área (promedio del rango sugerido)
const WEEKLY_HOURS_TARGET = {
  'Cursos de programación': 19,
  'Portafolio': 9,
  'MOVRA': 10.5,
  'Inglés': 7,
  'Prospección de clientes': 5.5,
  'Organización y revisión': 2,
};

// ====== ESTADO EN MEMORIA ======
// NOTA: este estado vive solo en memoria del navegador.
// Si quieres persistencia entre sesiones, conecta esto a
// localStorage, un backend, o exporta/importa JSON.
let state = {
  checklist: {},  // { 'Lunes': [true,false,...], ... }
  goals: [],      // {id, name, totalDays, currentDay}
  hoursLog: {},   // { area: hours } acumulado para la semana actual
  weekStart: getWeekStartKey(),
  reviews: [],    // { date, prog, portafolio, movra, clientes, ingles }
};

let goalIdCounter = 1;

function getWeekStartKey(){
  const d = new Date();
  const day = d.getDay(); // 0 = domingo ... 6 = sábado
  const diff = (day === 0 ? -6 : 1) - day; // ajusta para que la semana inicie en lunes
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function initChecklist(){
  DAYS.forEach(day => {
    const tasks = getTasksForDay(day);
    if (!state.checklist[day]) {
      state.checklist[day] = tasks.map(() => false);
    }
  });
}

function getTasksForDay(day){
  const isWeekend = (day === 'Viernes' || day === 'Sábado' || day === 'Domingo');
  return isWeekend ? WEEKEND_TASKS : WEEKDAY_TASKS;
}

// ====== TABS / NAVEGACIÓN ======
function setupTabs(){
  const tabs = document.querySelectorAll('.tab');
  const views = document.querySelectorAll('.view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.view).classList.add('active');

      if (tab.dataset.view === 'resumen') renderResumen();
      if (tab.dataset.view === 'semanal') renderSemanal();
      if (tab.dataset.view === 'objetivos') renderObjetivos();
    });
  });
}

// ====== CHECKLIST DIARIO ======
function setupDaySelector(){
  const daySelector = document.getElementById('daySelector');

  DAYS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    daySelector.appendChild(opt);
  });

  // Selecciona el día de hoy por defecto (lunes = índice 0)
  const todayIdx = (new Date().getDay() + 6) % 7;
  daySelector.value = DAYS[todayIdx];

  daySelector.addEventListener('change', renderChecklist);
}

function renderChecklist(){
  const daySelector = document.getElementById('daySelector');
  const day = daySelector.value;
  const isWeekend = (day === 'Viernes' || day === 'Sábado' || day === 'Domingo');

  document.getElementById('dayLabel').textContent = isWeekend
    ? 'Día de trabajo (mínimos obligatorios)'
    : 'Día base';

  const tasks = getTasksForDay(day);
  const checks = state.checklist[day];
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  tasks.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'check-item' + (checks[i] ? ' done' : '');
    item.innerHTML = `
      <input type="checkbox" id="t_${day}_${i}" ${checks[i] ? 'checked' : ''}>
      <label for="t_${day}_${i}"><span class="time-badge">${t.time}</span>${t.task}</label>
    `;

    item.querySelector('input').addEventListener('change', e => {
      state.checklist[day][i] = e.target.checked;
      item.classList.toggle('done', e.target.checked);
      updateDayProgress();
      renderResumen();
    });

    list.appendChild(item);
  });

  updateDayProgress();
}

function updateDayProgress(){
  const day = document.getElementById('daySelector').value;
  const checks = state.checklist[day];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  document.getElementById('dayPercent').textContent = pct + '%';

  const bar = document.getElementById('dayBar');
  bar.style.width = pct + '%';
  bar.className = 'progress-fill' + (pct < 40 ? ' red' : pct < 80 ? ' amber' : '');
}

function dayPercent(day){
  const checks = state.checklist[day];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ====== RESUMEN ======
function renderResumen(){
  const today = DAYS[(new Date().getDay() + 6) % 7];
  document.getElementById('statHoy').textContent = dayPercent(today) + '%';

  const weekAvg = Math.round(
    DAYS.reduce((acc, d) => acc + dayPercent(d), 0) / DAYS.length
  );
  document.getElementById('statSemana').textContent = weekAvg + '%';

  const goalAvg = state.goals.length
    ? Math.round(
        state.goals.reduce((acc, g) => acc + Math.min(100, Math.round((g.currentDay / g.totalDays) * 100)), 0)
        / state.goals.length
      )
    : 0;
  document.getElementById('statObjetivos').textContent = goalAvg + '%';

  const racha = DAYS.filter(d => dayPercent(d) >= 50).length;
  document.getElementById('statRacha').textContent = racha;

  renderWeekProgressBars();
  renderGoalsOverview();
}

function renderWeekProgressBars(){
  const weekDiv = document.getElementById('weekProgress');
  weekDiv.innerHTML = '';

  DAYS.forEach(d => {
    const pct = dayPercent(d);
    const row = document.createElement('div');
    row.className = 'progress-row';
    row.innerHTML = `
      <div class="progress-label"><span>${d}</span><span>${pct}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${barClass(pct)}" style="width:${pct}%"></div></div>
    `;
    weekDiv.appendChild(row);
  });
}

function renderGoalsOverview(){
  const goalsDiv = document.getElementById('goalsOverview');

  if (state.goals.length === 0) {
    goalsDiv.innerHTML = '<div class="empty">Aún no has agregado objetivos. Ve a la pestaña "Objetivos personalizados".</div>';
    return;
  }

  goalsDiv.innerHTML = '';
  state.goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.currentDay / g.totalDays) * 100));
    const row = document.createElement('div');
    row.className = 'progress-row';
    row.innerHTML = `
      <div class="progress-label"><span>${g.name} <span class="pill">día ${g.currentDay}/${g.totalDays}</span></span><span>${pct}%</span></div>
      <div class="progress-bar"><div class="progress-fill ${barClass(pct)}" style="width:${pct}%"></div></div>
    `;
    goalsDiv.appendChild(row);
  });
}

function barClass(pct){
  if (pct < 40) return 'red';
  if (pct < 80) return 'amber';
  return '';
}

// ====== DISTRIBUCIÓN SEMANAL ======
function renderSemanal(){
  // Reinicia el registro de horas si cambió la semana
  const currentWeek = getWeekStartKey();
  if (state.weekStart !== currentWeek) {
    state.weekStart = currentWeek;
    state.hoursLog = {};
  }

  renderWeeklyAllocation();
  renderHoursForm();
}

function renderWeeklyAllocation(){
  const allocDiv = document.getElementById('weeklyAllocation');
  allocDiv.innerHTML = '';

  Object.entries(WEEKLY_HOURS_TARGET).forEach(([area, target]) => {
    const logged = state.hoursLog[area] || 0;
    const pct = Math.min(100, Math.round((logged / target) * 100));

    const row = document.createElement('div');
    row.className = 'progress-row';
    row.innerHTML = `
      <div class="progress-label"><span>${area}</span><span>${logged}h / ${target}h (${pct}%)</span></div>
      <div class="progress-bar"><div class="progress-fill ${barClass(pct)}" style="width:${pct}%"></div></div>
    `;
    allocDiv.appendChild(row);
  });
}

function renderHoursForm(){
  const formDiv = document.getElementById('hoursForm');
  formDiv.innerHTML = '';

  Object.keys(WEEKLY_HOURS_TARGET).forEach(area => {
    const safeId = 'hours_' + area.replace(/\s/g, '_');

    const row = document.createElement('div');
    row.className = 'hours-row';
    row.innerHTML = `
      <span class="area-label">${area}</span>
      <input type="number" min="0" step="0.5" placeholder="0" id="${safeId}">
      <span class="unit">horas</span>
      <button class="add-btn" data-area="${area}">+ Agregar</button>
    `;

    row.querySelector('.add-btn').addEventListener('click', () => addHours(area));
    formDiv.appendChild(row);
  });
}

function addHours(area){
  const safeId = 'hours_' + area.replace(/\s/g, '_');
  const input = document.getElementById(safeId);
  const val = parseFloat(input.value);

  if (!val || val <= 0) return;

  state.hoursLog[area] = (state.hoursLog[area] || 0) + val;
  input.value = '';
  renderSemanal();
}

// ====== OBJETIVOS PERSONALIZADOS ======
function setupGoalForm(){
  document.getElementById('addGoalBtn').addEventListener('click', addGoal);
}

function addGoal(){
  const nameInput = document.getElementById('goalName');
  const daysInput = document.getElementById('goalDays');
  const startInput = document.getElementById('goalStart');

  const name = nameInput.value.trim();
  const days = parseInt(daysInput.value);
  const start = parseInt(startInput.value) || 0;

  if (!name || !days || days <= 0) return;

  state.goals.push({
    id: goalIdCounter++,
    name,
    totalDays: days,
    currentDay: Math.min(start, days),
  });

  nameInput.value = '';
  daysInput.value = '';
  startInput.value = '0';

  renderObjetivos();
}

function removeGoal(id){
  state.goals = state.goals.filter(g => g.id !== id);
  renderObjetivos();
}

function advanceGoal(id, delta){
  const g = state.goals.find(g => g.id === id);
  if (!g) return;

  g.currentDay = Math.max(0, Math.min(g.totalDays, g.currentDay + delta));
  renderObjetivos();
}

function renderObjetivos(){
  const list = document.getElementById('goalsList');

  if (state.goals.length === 0) {
    list.innerHTML = '<div class="empty">No tienes objetivos agregados todavía. Crea uno arriba con un nombre y la cantidad de días que durará.</div>';
    return;
  }

  list.innerHTML = '';
  state.goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.currentDay / g.totalDays) * 100));

    const card = document.createElement('div');
    card.className = 'goal-card';
    card.innerHTML = `
      <div class="goal-head">
        <div class="goal-name">${g.name}</div>
        <div class="goal-actions">
          <button class="adv" data-action="dec" aria-label="Restar día">−</button>
          <button class="adv" data-action="inc" aria-label="Sumar día">+</button>
          <button data-action="remove" aria-label="Eliminar">Eliminar</button>
        </div>
      </div>
      <div class="goal-meta">Día ${g.currentDay} de ${g.totalDays}</div>
      <div class="progress-bar"><div class="progress-fill ${barClass(pct)}" style="width:${pct}%"></div></div>
      <div style="text-align:right; font-size:12px; color:var(--text-dim); margin-top:4px;">${pct}%</div>
    `;

    card.querySelector('[data-action="dec"]').addEventListener('click', () => advanceGoal(g.id, -1));
    card.querySelector('[data-action="inc"]').addEventListener('click', () => advanceGoal(g.id, 1));
    card.querySelector('[data-action="remove"]').addEventListener('click', () => removeGoal(g.id));

    list.appendChild(card);
  });
}

// ====== REVISIÓN SEMANAL ======
function setupReviewForm(){
  document.getElementById('saveReviewBtn').addEventListener('click', saveReview);
}

function saveReview(){
  const review = {
    date: new Date().toLocaleDateString('es-CO'),
    prog: document.getElementById('revProg').value.trim(),
    portafolio: document.getElementById('revPortafolio').value.trim(),
    movra: document.getElementById('revMovra').value.trim(),
    clientes: document.getElementById('revClientes').value.trim(),
    ingles: document.getElementById('revIngles').value.trim(),
  };

  state.reviews.unshift(review);

  ['revProg', 'revPortafolio', 'revMovra', 'revClientes', 'revIngles']
    .forEach(id => document.getElementById(id).value = '');

  const savedMsg = document.getElementById('reviewSaved');
  savedMsg.textContent = 'Guardado ✓';
  setTimeout(() => savedMsg.textContent = '', 2000);

  renderReviewHistory();
}

function renderReviewHistory(){
  const card = document.getElementById('reviewHistoryCard');
  const div = document.getElementById('reviewHistory');

  if (state.reviews.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  div.innerHTML = '';

  state.reviews.forEach(r => {
    const item = document.createElement('div');
    item.className = 'review-item';
    item.innerHTML = `
      <div class="review-date">${r.date}</div>
      ${r.prog ? `<div class="review-field"><strong>Programación:</strong> ${r.prog}</div>` : ''}
      ${r.portafolio ? `<div class="review-field"><strong>Portafolio:</strong> ${r.portafolio}</div>` : ''}
      ${r.movra ? `<div class="review-field"><strong>MOVRA:</strong> ${r.movra}</div>` : ''}
      ${r.clientes ? `<div class="review-field"><strong>Clientes:</strong> ${r.clientes}</div>` : ''}
      ${r.ingles ? `<div class="review-field"><strong>Inglés:</strong> ${r.ingles}</div>` : ''}
    `;
    div.appendChild(item);
  });
}

// ====== INICIALIZACIÓN ======
function init(){
  initChecklist();
  setupTabs();
  setupDaySelector();
  setupGoalForm();
  setupReviewForm();

  renderChecklist();
  renderResumen();
  renderSemanal();
  renderObjetivos();
  renderReviewHistory();
}

document.addEventListener('DOMContentLoaded', init);
