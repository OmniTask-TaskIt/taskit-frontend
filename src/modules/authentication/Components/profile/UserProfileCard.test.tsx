import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCard from './UserProfileCard';
import { profileService } from '../../services/profileService';
import type { Profile } from '../../types/profile.types';
import { makeAxiosError } from '../../../../test/helpers';

vi.mock('../../services/profileService', () => ({
  profileService: { searchProfiles: vi.fn(), updateProfile: vi.fn(), uploadPhoto: vi.fn(), uploadDocument: vi.fn() },
}));

const profile = (o: Partial<Profile> = {}): Profile => ({
  userId: 'u1', fullName: 'Ana Pérez', description: 'Plomera con 10 años de experiencia', photoUrl: '',
  categories: ['Plomería'], locationCoverage: 'Bogotá', reputationScore: 4.8, totalReviews: 20,
  identityVerificationStatus: 'UNVERIFIED', ...o,
});

describe('UserProfileCard (mi perfil)', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('carga el perfil propio buscándolo por el correo de la sesión y guarda el userId', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    render(<UserProfileCard />);

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(profileService.searchProfiles).toHaveBeenCalledWith('ana@gmail.com');
    expect(screen.getByText('Plomera con 10 años de experiencia')).toBeInTheDocument();
    expect(screen.getByText('Plomería')).toBeInTheDocument();
    expect(localStorage.getItem('userId')).toBe('u1');
  });

  it('sin perfil NO inventa datos (ni reputación 5.0 ni "en revisión"): avisa que no se encontró', async () => {
    localStorage.setItem('userEmail', 'robin@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([]);
    render(<UserProfileCard />);

    expect(await screen.findByText(/no se encontró información de perfil/i)).toBeInTheDocument();
    expect(screen.queryByText(/en revisión/i)).not.toBeInTheDocument();
    expect(screen.queryByText('5.0')).not.toBeInTheDocument();
  });

  it('si falla la carga no se rompe', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(profileService.searchProfiles).mockRejectedValue(new Error('500'));
    render(<UserProfileCard />);

    await waitFor(() => expect(screen.queryByText(/cargando tu perfil/i)).not.toBeInTheDocument());
  });

  it('edita y guarda: descripción, zona y categorías (separadas por coma)', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    vi.mocked(profileService.updateProfile).mockResolvedValue(
      profile({ description: 'Nueva descripción', locationCoverage: 'Medellín', categories: ['Electricidad', 'Pintura'] })
    );
    const user = userEvent.setup();
    render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    await user.click(screen.getByRole('button', { name: /editar perfil/i }));
    
    // Usar fireEvent.change en lugar de user.type optimiza dramáticamente el rendimiento del renderizado en pruebas
    const description = screen.getByLabelText('Descripción');
    fireEvent.change(description, { target: { value: '  Nueva descripción  ' } });
    
    const zone = screen.getByLabelText(/zona de cobertura/i);
    fireEvent.change(zone, { target: { value: 'Medellín' } });
    
    const categories = screen.getByLabelText(/categorías/i);
    fireEvent.change(categories, { target: { value: 'Electricidad, Pintura, ,' } });
    
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() =>
      expect(profileService.updateProfile).toHaveBeenCalledWith('u1', {
        description: 'Nueva descripción',
        locationCoverage: 'Medellín',
        categories: ['Electricidad', 'Pintura'],
      })
    );
    expect(await screen.findByText('Nueva descripción')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument();
  });

  it('si guardar falla muestra el error y mantiene el editor abierto', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    vi.mocked(profileService.updateProfile).mockRejectedValue(new Error('500'));
    const user = userEvent.setup();
    render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    await user.click(screen.getByRole('button', { name: /editar perfil/i }));
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(await screen.findByText(/no se pudo guardar el perfil/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });

  it('cancelar cierra el editor sin llamar al backend', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    const user = userEvent.setup();
    render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    await user.click(screen.getByRole('button', { name: /editar perfil/i }));
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.queryByRole('button', { name: /guardar cambios/i })).not.toBeInTheDocument();
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it('subir documento de identidad lo envía y el panel pasa a "en revisión" (según el estado del backend)', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    vi.mocked(profileService.uploadDocument).mockResolvedValue(profile({ identityVerificationStatus: 'PENDING_REVIEW' }));
    const user = userEvent.setup();
    const { container } = render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    const file = new File(['%PDF'], 'cedula.pdf', { type: 'application/pdf' });
    await user.upload(container.querySelector('input[accept=".pdf,.png,.jpg,.jpeg"]') as HTMLInputElement, file);

    await waitFor(() => expect(profileService.uploadDocument).toHaveBeenCalledWith('u1', file));
    expect(await screen.findByRole('status')).toHaveTextContent(/enviado a revisión/i);
    expect(await screen.findByText(/tu documento está en revisión/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument();
  });

  it('si el backend rechaza el documento muestra SU mensaje (no uno genérico)', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    vi.mocked(profileService.uploadDocument).mockRejectedValue(
      makeAxiosError({ message: 'El archivo supera el tamaño máximo permitido.' })
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const { container } = render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    const file = new File(['x'], 'grande.pdf', { type: 'application/pdf' });
    await user.upload(container.querySelector('input[accept=".pdf,.png,.jpg,.jpeg"]') as HTMLInputElement, file);

    expect(await screen.findByRole('alert')).toHaveTextContent('El archivo supera el tamaño máximo permitido.');
    expect(screen.queryByText(/no se pudo cargar el documento de identidad/i)).not.toBeInTheDocument();
  });

  describe('panel de documento de identidad según el estado del perfil', () => {
    const cases: [Profile['identityVerificationStatus'], RegExp, string | null][] = [
      ['UNVERIFIED', /sube tu documento de identidad/i, 'Subir documento'],
      ['PENDING_REVIEW', /tu documento está en revisión/i, null],
      ['VERIFIED', /tu identidad está verificada/i, null],
      ['REJECTED', /tu documento fue rechazado/i, 'Subir nuevo documento'],
    ];

    it.each(cases)('%s', async (status, message, buttonLabel) => {
      localStorage.setItem('userEmail', 'ana@gmail.com');
      vi.mocked(profileService.searchProfiles).mockResolvedValue([profile({ identityVerificationStatus: status })]);
      render(<UserProfileCard />);
      await screen.findByText('Ana Pérez');

      expect(screen.getByText(message)).toBeInTheDocument();
      if (buttonLabel) expect(screen.getByRole('button', { name: buttonLabel })).toBeInTheDocument();
      else expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument();
    });
  });

  it('subir una foto actualiza la imagen con la URL devuelta', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    vi.mocked(profileService.uploadPhoto).mockResolvedValue('https://cdn/foto.png');
    const user = userEvent.setup();
    const { container } = render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    await user.upload(container.querySelector('input[accept="image/*"]') as HTMLInputElement, file);

    await waitFor(() => expect(profileService.uploadPhoto).toHaveBeenCalledWith('u1', file));
    await waitFor(() => expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn/foto.png'));
  });

  it('incluye la zona de peligro para eliminar la cuenta', async () => {
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([profile()]);
    render(<UserProfileCard />);
    await screen.findByText('Ana Pérez');

    expect(screen.getByRole('button', { name: /eliminar mi cuenta/i })).toBeInTheDocument();
  });
});