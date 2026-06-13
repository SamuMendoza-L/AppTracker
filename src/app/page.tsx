'use client';

import { useState } from 'react';
import { useProgressData } from '@/lib/useProgressData';
import ResumenView from '@/components/ResumenView';
import ChecklistView from '@/components/ChecklistView';
import SemanalView from '@/components/SemanalView';
import ObjetivosView from '@/components/ObjetivosView';
import RevisionView from '@/components/RevisionView';
import AcumuladoView from '@/components/AcumuladoView';

type TabKey = 'resumen' | 'checklist' | 'semanal' | 'objetivos' | 'revision' | 'acumulado';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'checklist', label: 'Checklist diario' },
  { key: 'semanal', label: 'Distribución semanal' },
  { key: 'objetivos', label: 'Objetivos personalizados' },
  { key: 'revision', label: 'Revisión semanal' },
  { key: 'acumulado', label: 'Progreso acumulado' },
];

export default function Home() {
  const [tab, setTab] = useState<TabKey>('resumen');
  const data = useProgressData();

  return (
    <div className="container">
      <header>
        <h1>Plan maestro · Mindset</h1>
        <p>Sigue tu progreso diario, semanal y por objetivos personalizados.</p>
      </header>

      {data.error && <div className="banner error">{data.error}</div>}
      {data.loading && <div className="banner">Cargando datos desde Supabase...</div>}

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!data.loading && (
        <>
          {tab === 'resumen' && <ResumenView {...data} />}
          {tab === 'checklist' && <ChecklistView {...data} />}
          {tab === 'semanal' && <SemanalView {...data} />}
          {tab === 'objetivos' && <ObjetivosView {...data} />}
          {tab === 'revision' && <RevisionView {...data} />}
          {tab === 'acumulado' && <AcumuladoView {...data} />}
        </>
      )}
    </div>
  );
}
