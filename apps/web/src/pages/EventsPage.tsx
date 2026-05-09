import { FormEvent, useEffect, useState } from 'react';

import { apiRequest, ApiError } from '../lib/api';
import type { EventItem, EventPayload } from '../types';

const initialForm: EventPayload = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: ''
};

function toDateTimeInput(value: string) {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [formData, setFormData] = useState<EventPayload>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<EventItem[]>('/events');
      setEvents(data);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString()
      };

      if (editingId) {
        await apiRequest(`/events/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/events', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      await loadEvents();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao salvar evento.');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(event: EventItem) {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description ?? '',
      location: event.location ?? '',
      startsAt: toDateTimeInput(event.startsAt),
      endsAt: toDateTimeInput(event.endsAt)
    });
  }

  async function removeEvent(id: string) {
    if (!window.confirm('Deseja realmente excluir este evento?')) {
      return;
    }

    try {
      await apiRequest(`/events/${id}`, { method: 'DELETE' });
      await loadEvents();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao excluir evento.');
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar evento' : 'Novo evento'}</h2>
          <span>Cadastre eventos com data, local e descricao.</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Titulo</span>
            <input
              value={formData.title}
              onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Local</span>
            <input
              value={formData.location}
              onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}
            />
          </label>

          <label>
            <span>Inicio</span>
            <input
              type="datetime-local"
              value={formData.startsAt}
              onChange={(event) => setFormData((current) => ({ ...current, startsAt: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Fim</span>
            <input
              type="datetime-local"
              value={formData.endsAt}
              onChange={(event) => setFormData((current) => ({ ...current, endsAt: event.target.value }))}
              required
            />
          </label>

          <label className="full-width">
            <span>Descricao</span>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          {error ? <p className="form-error full-width">{error}</p> : null}

          <div className="actions full-width">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Salvando...' : editingId ? 'Atualizar evento' : 'Criar evento'}
            </button>
            {editingId ? (
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Lista de eventos</h2>
          <span>{events.length} registro(s)</span>
        </div>

        {loading ? <p>Carregando...</p> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Local</th>
                  <th>Inicio</th>
                  <th>Fim</th>
                  <th>Criado por</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.location ?? 'Sem local'}</td>
                    <td>{new Date(event.startsAt).toLocaleString('pt-BR')}</td>
                    <td>{new Date(event.endsAt).toLocaleString('pt-BR')}</td>
                    <td>{event.createdBy.name}</td>
                    <td className="table-actions">
                      <button type="button" className="link-button" onClick={() => startEdit(event)}>Editar</button>
                      <button type="button" className="link-button danger" onClick={() => void removeEvent(event.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
