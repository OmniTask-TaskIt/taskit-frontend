import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AitaRecommendedTasks from './AitaRecommendedTasks';
import { profileService } from '../../authentication/services/profileService';
import { taskService } from '../../tasks/services/taskService';
import { aitaService } from '../services/aita.service';
import type { Task } from '../../tasks/types/task.types';

vi.mock('../../authentication/services/profileService', () => ({
  profileService: { searchProfiles: vi.fn() },
}));

vi.mock('../../tasks/services/taskService', () => ({
  taskService: { getCategories: vi.fn(), getTaskFeed: vi.fn() },
}));

vi.mock('../services/aita.service', () => ({
  aitaService: { indexProvider: vi.fn(), searchProviders: vi.fn() },
}));

const task = (overrides: Partial<Task>): Task => ({
  taskId: 't1',
  taskName: 'Pintar una sala',
  taskDescription: 'Pintar la sala principal.',
  taskStatus: 'ACTIVE',
  taskOwner: 'otro',
  creationDate: '2026-01-01T00:00:00Z',
  category: 'ARREGLOS',
  price: 100000,
  ownerApproval: false,
  assigneeApproval: false,
  title: 'Pintar una sala',
  description: 'Pintar la sala principal.',
  status: 'ACTIVE',
  ownerId: 'otro',
  ...overrides,
});

describe('AitaRecommendedTasks', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('userEmail', 'ana@gmail.com');
    vi.mocked(profileService.searchProfiles).mockResolvedValue([
      {
        userId: 'prov-1',
        fullName: 'Ana',
        description: 'Pinto interiores',
        photoUrl: '',
        categories: ['ARREGLOS'],
        locationCoverage: 'Bogotá',
        reputationScore: 4,
        totalReviews: 2,
        identityVerificationStatus: 'VERIFIED',
      },
    ]);
    vi.mocked(taskService.getCategories).mockResolvedValue(['ARREGLOS']);
    vi.mocked(aitaService.indexProvider).mockResolvedValue({ resource_id: 'prov-1', status: 'indexed' });
  });

  it('muestra solo las tareas en las que el prestador aparece como compatible', async () => {
    vi.mocked(taskService.getTaskFeed).mockResolvedValue([
      task({ taskId: 'mia', ownerId: 'prov-1', taskOwner: 'prov-1', title: 'Mi propia tarea', taskName: 'Mi propia tarea' }),
      task({ taskId: 'ajena', title: 'Pintar una sala', taskName: 'Pintar una sala' }),
    ]);
    vi.mocked(aitaService.searchProviders).mockResolvedValue([
      { task_id: 'ajena', provider_id: 'prov-1', score: 0.91, rationale: 'Coincide con pintura' },
    ]);
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<AitaRecommendedTasks onOpen={onOpen} />);

    expect(await screen.findByRole('heading', { name: /tareas recomendadas para ti/i })).toBeInTheDocument();
    expect(await screen.findByText('Pintar una sala')).toBeInTheDocument();
    expect(screen.queryByText('Mi propia tarea')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /postularme/i }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ taskId: 'ajena' }));
  });
});
