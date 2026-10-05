import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import { authStore } from '../../services/authStore';

function makeJwt(role?: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'test@taskit.com', exp: Math.floor(Date.now() / 1000) + 3600, role }));
  return `${header}.${payload}.signature`;
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route path="/dashboard" element={<div>Dashboard normal</div>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Panel de administración</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  afterEach(() => localStorage.clear());

  it('redirige a /login si no hay sesión', () => {
    renderAdminRoute();
    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('redirige a /dashboard si el usuario está logueado pero no es ADMIN', () => {
    authStore.setTokens(makeJwt('SEEKER'), 'refresh');
    renderAdminRoute();
    expect(screen.getByText('Dashboard normal')).toBeInTheDocument();
  });

  it('muestra el panel si el usuario es ADMIN', () => {
    authStore.setTokens(makeJwt('ADMIN'), 'refresh');
    renderAdminRoute();
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
  });
});
