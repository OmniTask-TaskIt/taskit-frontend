import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import type { Task } from '../types/task.types';
import { aitaService } from '../../aita/services/aita.service';

vi.mock('../../aita/services/aita.service', () => ({
  aitaService: {
    indexTask: vi.fn().mockResolvedValue({ resource_id: 't1', status: 'indexed' }),
    searchProviders: vi.fn().mockResolvedValue([
      { task_id: 't1', provider_id: 'p1', score: 0.82, rationale: 'Encaja con la tarea' },
    ]),
    analyzeShield: vi.fn(),
  },
}));

vi.mock('../../authentication/services/profileService', () => ({
  profileService: {
    getProfile: vi.fn().mockResolvedValue({ userId: 'p1', fullName: 'Ana Pérez', description: '', photoUrl: '', categories: [], locationCoverage: '', reputationScore: 0, totalReviews: 0, identityVerificationStatus: 'UNVERIFIED' }),
  },
}));

const task: Task = {
  taskId: 't1',
  taskName: 'Arreglar fuga',
  taskDescription: 'Hay una fuga bajo el lavaplatos.',
  taskStatus: 'ACTIVE',
  taskOwner: 'seeker-1',
  creationDate: '2026-01-01T00:00:00Z',
  category: 'ARREGLOS',
  price: 90000,
  ownerApproval: false,
  assigneeApproval: false,
  title: 'Arreglar fuga',
  description: 'Hay una fuga bajo el lavaplatos.',
  status: 'ACTIVE',
  ownerId: 'seeker-1',
};

function renderDetail(props: Partial<Parameters<typeof TaskDetail>[0]> = {}) {
  return render(
    <MemoryRouter>
      <TaskDetail task={task} onClose={vi.fn()} onAccept={vi.fn()} canAccept={false} {...props} />
    </MemoryRouter>,
  );
}

describe('TaskDetail según el rol', () => {
  it('el demandante ve profesionales sugeridos y no ve Shield', async () => {
    renderDetail({ showSuggestions: true, showShield: false });

    expect(await screen.findByRole('heading', { name: /aita te sugiere estos profesionales/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /shield/i })).not.toBeInTheDocument();
    expect(aitaService.searchProviders).toHaveBeenCalled();
  });

  it('el prestador que va a aceptar ve Shield y no ve profesionales sugeridos', () => {
    renderDetail({ showShield: true, showSuggestions: false, canAccept: true });

    expect(screen.getByRole('button', { name: /revisar con shield antes de aceptar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceptar tarea/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /profesionales/i })).not.toBeInTheDocument();
  });
});
