import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { authStore } from '../../services/authStore';
import { makeJwt } from '../../../../test/helpers';

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Página de login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Contenido privado</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear());

  it('redirige a /login y limpia la sesión si no hay token', () => {
    localStorage.setItem('userEmail', 'sobrante@taskit.com');

    renderRoute();

    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('redirige a /login si el token ya expiró', () => {
    authStore.setTokens(makeJwt({ expiresInSeconds: -60 }), 'refresh');

    renderRoute();

    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('muestra el contenido con un token vigente', () => {
    authStore.setTokens(makeJwt(), 'refresh');

    renderRoute();

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});
