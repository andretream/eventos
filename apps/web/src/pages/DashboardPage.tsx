import { useEffect, useState } from 'react';

import { apiRequest, ApiError } from '../lib/api';
import { EventCalendar } from '../components/EventCalendar';
import type { EventItem } from '../types';

export function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const data = await apiRequest<EventItem[]>('/events');

        if (active) {
          setEvents(data);
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao carregar eventos.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const upcomingEvents = events.filter((event) => new Date(event.startsAt) >= new Date()).length;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Visao geral da agenda</h2>
          <p>Consulte rapidamente os eventos planejados e o volume de operacao em aberto.</p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Total de eventos</span>
            <strong>{events.length}</strong>
          </article>
          <article className="stat-card">
            <span>Proximos eventos</span>
            <strong>{upcomingEvents}</strong>
          </article>
        </div>
      </section>

      {loading ? <div className="panel">Carregando eventos...</div> : null}
      {error ? <div className="panel form-error">{error}</div> : null}
      {!loading && !error ? <EventCalendar events={events} /> : null}
    </div>
  );
}
