import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { authStore } from '../services/authStore';
import { redirectToLogin } from '../../../utils/navigation';
import { makeJwt } from '../../../test/helpers';

vi.mock('../Components/profile/UserProfileCard', () => ({ default: () => <div>SECCION-PERFIL</div> }));
vi.mock('../Components/profile/ProfileSearchSection', () => ({ default: () => <div>SECCION-BUSCAR</div> }));
vi.mock('../Components/ui/TaskSectionPlaceholder', () => ({ default: () => <div>SECCION-TAREAS</div> }));
vi.mock('../../../utils/navigation', () => ({ redirectToLogin: vi.fn() }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('abre en "Mi perfil" y cambia de sección con la navegación', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText('SECCION-PERFIL')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /buscar profesionales/i })[0]);
    expect(await screen.findByText('SECCION-BUSCAR')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /gestión de tareas/i })[0]);
    expect(await screen.findByText('SECCION-TAREAS')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /mi perfil/i })[0]);
    expect(await screen.findByText('SECCION-PERFIL')).toBeInTheDocument();
  });

  it('un usuario normal no ve el acceso al panel de administración', () => {
    authStore.setTokens(makeJwt({ role: 'SEEKER' }), 'refresh');
    renderPage();

    expect(screen.queryByRole('link', { name: /panel de administración/i })).not.toBeInTheDocument();
  });

  it('un administrador ve el acceso y apunta a /admin', () => {
    authStore.setTokens(makeJwt({ role: 'ADMIN' }), 'refresh');
    renderPage();

    const links = screen.getAllByRole('link', { name: /panel de administración/i });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/admin'));
  });

  it('cerrar sesión borra tokens y datos locales y vuelve al login', async () => {
    authStore.setTokens(makeJwt(), 'refresh');
    localStorage.setItem('userEmail', 'ana@gmail.com');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /cerrar sesión/i })[0]);

    expect(authStore.getAccessToken()).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });
});
