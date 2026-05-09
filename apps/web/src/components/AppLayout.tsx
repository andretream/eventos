import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Eventos' },
  { to: '/users', label: 'Usuarios' }
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Event OS</p>
          <h1>Painel de eventos</h1>
          <p className="sidebar-copy">Gerencie agenda, equipe e operacao em um unico fluxo.</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <span className="role-badge">{user?.role}</span>
          <button type="button" className="secondary-button" onClick={logout}>Sair</button>
        </div>
      </aside>

      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
