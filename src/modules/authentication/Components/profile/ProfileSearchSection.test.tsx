import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSearchSection from './ProfileSearchSection';
import { profileService } from '../../services/profileService';
import type { Profile } from '../../types/profile.types';

vi.mock('../../services/profileService', () => ({ profileService: { searchProfiles: vi.fn() } }));
vi.mock('./ProfileReviews', () => ({ default: ({ userId }: { userId: string }) => <div>Reseñas de {userId}</div> }));
vi.mock('./ReportProfileModal', () => ({
  default: ({ userName, onClose }: { userName: string; onClose: () => void }) => (
    <div>
      Reportando a {userName}
      <button onClick={onClose}>cerrar-reporte</button>
    </div>
  ),
}));

const profile = (o: Partial<Profile> = {}): Profile => ({
  userId: 'u2', fullName: 'Robin Plomero', description: 'Arreglo fugas', photoUrl: '', categories: ['Plomería'],
  locationCoverage: 'Bogotá', reputationScore: 4.5, totalReviews: 12, identityVerificationStatus: 'VERIFIED', ...o,
});

async function search(user: ReturnType<typeof userEvent.setup>, text = 'Robin') {
  await user.type(screen.getByPlaceholderText(/buscar por nombre/i), text);
  await user.click(screen.getByRole('button', { name: /^buscar$/i }));
}

describe('ProfileSearchSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('busca por nombre y lista los resultados', async () => {
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    const user = userEvent.setup();
    render(<ProfileSearchSection />);

    await search(user);

    expect(await screen.findByText('Robin Plomero')).toBeInTheDocument();
    expect(profileService.searchProfiles).toHaveBeenCalledWith('Robin');
  });

  it('no consulta con el campo vacío', async () => {
    const user = userEvent.setup();
    render(<ProfileSearchSection />);

    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(profileService.searchProfiles).not.toHaveBeenCalled();
  });

  it('sin resultados o con error muestra el mensaje de vacío', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(profileService.searchProfiles).mockRejectedValue(new Error('500'));
    const user = userEvent.setup();
    render(<ProfileSearchSection />);

    await search(user, 'xyz');

    expect(await screen.findByText(/no se encontraron profesionales/i)).toBeInTheDocument();
  });

  it('abrir un resultado muestra su detalle con reseñas y permite reportarlo', async () => {
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    const user = userEvent.setup();
    render(<ProfileSearchSection />);
    await search(user);

    await user.click(await screen.findByText('Robin Plomero'));
    expect(await screen.findByText('Reseñas de u2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reportar perfil/i }));
    expect(screen.getByText('Reportando a Robin Plomero')).toBeInTheDocument();
  });

  it('no deja que alguien se reporte a sí mismo', async () => {
    localStorage.setItem('userId', 'u2');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    const user = userEvent.setup();
    render(<ProfileSearchSection />);
    await search(user);

    await user.click(await screen.findByText('Robin Plomero'));
    await screen.findByText('Reseñas de u2');

    expect(screen.queryByRole('button', { name: /reportar perfil/i })).not.toBeInTheDocument();
  });

  it('cerrar el detalle lo oculta', async () => {
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    const user = userEvent.setup();
    render(<ProfileSearchSection />);
    await search(user);
    await user.click(await screen.findByText('Robin Plomero'));
    await screen.findByText('Reseñas de u2');

    await user.click(screen.getByRole('button', { name: /^cerrar$/i }));

    await waitFor(() => expect(screen.queryByText('Reseñas de u2')).not.toBeInTheDocument());
  });
});
