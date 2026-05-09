import { FormEvent, useEffect, useState } from 'react';

import { apiRequest, ApiError } from '../lib/api';
import type { User, UserPayload, UserRole } from '../types';

const initialForm: UserPayload = {
  name: '',
  email: '',
  password: '',
  role: 'STAFF'
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserPayload>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<User[]>('/users');
      setUsers(data);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao carregar usuarios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
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
      if (editingId) {
        await apiRequest(`/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      resetForm();
      await loadUsers();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao salvar usuario.');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
  }

  async function removeUser(id: string) {
    if (!window.confirm('Deseja realmente excluir este usuario?')) {
      return;
    }

    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      await loadUsers();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Falha ao excluir usuario.');
    }
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>{editingId ? 'Editar usuario' : 'Novo usuario'}</h2>
          <span>Controle a equipe que acessa o sistema.</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Nome</span>
            <input
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>E-mail</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Senha {editingId ? '(opcional)' : ''}</span>
            <input
              type="password"
              value={formData.password ?? ''}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              required={!editingId}
            />
          </label>

          <label>
            <span>Perfil</span>
            <select
              value={formData.role}
              onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>
          </label>

          {error ? <p className="form-error full-width">{error}</p> : null}

          <div className="actions full-width">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Salvando...' : editingId ? 'Atualizar usuario' : 'Criar usuario'}
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
          <h2>Lista de usuarios</h2>
          <span>{users.length} registro(s)</span>
        </div>

        {loading ? <p>Carregando...</p> : null}

        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Criado em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="table-actions">
                      <button type="button" className="link-button" onClick={() => startEdit(user)}>Editar</button>
                      <button type="button" className="link-button danger" onClick={() => void removeUser(user.id)}>Excluir</button>
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
