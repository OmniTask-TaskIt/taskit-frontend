import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GithubLoginButton from './GithubLoginButton';
import { redirectTo } from '../../../../utils/navigation';

const mockEnv = vi.hoisted(() => ({
  githubClientId: 'client-123',
  githubRedirectUri: 'http://localhost:5173/auth/github/callback',
}));
vi.mock('../../Config/env', () => ({ env: mockEnv }));
vi.mock('../../../../utils/navigation', () => ({ redirectTo: vi.fn() }));

describe('GithubLoginButton', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockEnv.githubClientId = 'client-123';
    vi.mocked(redirectTo).mockClear();
  });
  afterEach(() => vi.clearAllMocks());

  it('si está deshabilitado (no se aceptaron los Términos) avisa y NO inicia el flujo', async () => {
    const onBlockedClick = vi.fn();
    render(<GithubLoginButton disabled onBlockedClick={onBlockedClick} />);

    await userEvent.click(screen.getByRole('button', { name: /continuar con github/i }));

    expect(onBlockedClick).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('githubOauthTermsAccepted')).toBeNull();
    expect(sessionStorage.getItem('githubOauthState')).toBeNull();
    expect(redirectTo).not.toHaveBeenCalled();
  });

  it('si falta el Client ID avisa en vez de redirigir a un GitHub roto', async () => {
    mockEnv.githubClientId = '';
    const onBlockedClick = vi.fn();
    render(<GithubLoginButton onBlockedClick={onBlockedClick} />);

    await userEvent.click(screen.getByRole('button', { name: /continuar con github/i }));

    expect(onBlockedClick).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('githubOauthTermsAccepted')).toBeNull();
  });

  it('habilitado: recuerda la aceptación de Términos para enviarla al volver del callback', async () => {
    render(<GithubLoginButton />);

    await userEvent.click(screen.getByRole('button', { name: /continuar con github/i }));

    expect(sessionStorage.getItem('githubOauthTermsAccepted')).toBe('true');
    expect(sessionStorage.getItem('githubOauthState')).toMatch(/^[0-9a-f]{32}$/);
  });

  it('habilitado: redirige a GitHub con client_id, redirect_uri y scopes correctos', async () => {
    render(<GithubLoginButton />);

    await userEvent.click(screen.getByRole('button', { name: /continuar con github/i }));

    expect(redirectTo).toHaveBeenCalledTimes(1);
    const url = new URL(vi.mocked(redirectTo).mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(url.searchParams.get('client_id')).toBe('client-123');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:5173/auth/github/callback');
    expect(url.searchParams.get('scope')).toBe('read:user user:email');
    // El `state` enviado a GitHub es el mismo que se guardó para verificarlo al volver.
    expect(url.searchParams.get('state')).toBe(sessionStorage.getItem('githubOauthState'));
    expect(url.searchParams.get('state')).toMatch(/^[0-9a-f]{32}$/);
  });
});
