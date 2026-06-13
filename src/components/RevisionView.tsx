'use client';

import { useState } from 'react';
import type { useProgressData } from '@/lib/useProgressData';

type Props = ReturnType<typeof useProgressData>;

export default function RevisionView(props: Props) {
  const { reviews, saveReview } = props;

  const [prog, setProg] = useState('');
  const [portafolio, setPortafolio] = useState('');
  const [movra, setMovra] = useState('');
  const [clientes, setClientes] = useState('');
  const [ingles, setIngles] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  async function handleSave() {
    await saveReview({ prog, portafolio, movra, clientes, ingles });
    setProg('');
    setPortafolio('');
    setMovra('');
    setClientes('');
    setIngles('');
    setSavedMsg('Guardado ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Revisión del domingo</div>

        <div className="review-q">
          Programación — ¿Cuántos módulos terminé? ¿Qué aprendí? ¿Qué proyecto avancé?
        </div>
        <textarea
          placeholder="Escribe aquí..."
          value={prog}
          onChange={(e) => setProg(e.target.value)}
        />

        <div className="review-q">Portafolio — ¿Qué sección terminé? ¿Qué falta?</div>
        <textarea
          placeholder="Escribe aquí..."
          value={portafolio}
          onChange={(e) => setPortafolio(e.target.value)}
        />

        <div className="review-q">
          MOVRA — ¿Qué publiqué? ¿Qué validé? ¿Qué resultados obtuve?
        </div>
        <textarea
          placeholder="Escribe aquí..."
          value={movra}
          onChange={(e) => setMovra(e.target.value)}
        />

        <div className="review-q">
          Clientes — ¿Cuántos contactos hice? ¿Cuántas conversaciones inicié? ¿Cuántas
          propuestas envié?
        </div>
        <textarea
          placeholder="Escribe aquí..."
          value={clientes}
          onChange={(e) => setClientes(e.target.value)}
        />

        <div className="review-q">Inglés — ¿Cuántas horas completé?</div>
        <textarea
          placeholder="Escribe aquí..."
          style={{ minHeight: 50 }}
          value={ingles}
          onChange={(e) => setIngles(e.target.value)}
        />

        <div className="review-save-row">
          <button className="btn" onClick={handleSave}>
            Guardar revisión
          </button>
          <span className="saved-msg">{savedMsg}</span>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="card">
          <div className="card-title">Historial de revisiones</div>
          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-date">Semana del {r.week_start}</div>
              {r.prog && (
                <div className="review-field">
                  <strong>Programación:</strong> {r.prog}
                </div>
              )}
              {r.portafolio && (
                <div className="review-field">
                  <strong>Portafolio:</strong> {r.portafolio}
                </div>
              )}
              {r.movra && (
                <div className="review-field">
                  <strong>MOVRA:</strong> {r.movra}
                </div>
              )}
              {r.clientes && (
                <div className="review-field">
                  <strong>Clientes:</strong> {r.clientes}
                </div>
              )}
              {r.ingles && (
                <div className="review-field">
                  <strong>Inglés:</strong> {r.ingles}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
