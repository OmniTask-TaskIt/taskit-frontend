import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Task } from '../../modules/tasks/types/task.types';
import EscrowActionCard from './EscrowActionCard';

const taskApi = vi.hoisted(() => ({
  getCompletionStatus: vi.fn(),
}));

vi.mock('../../hooks/usePayments', () => ({
  usePayments: () => ({ items: [], loading: false, error: null, refresh: vi.fn() }),
}));

vi.mock('../../modules/tasks/services/taskService', () => ({
  taskService: {
    getCompletionStatus: taskApi.getCompletionStatus,
    completeTask: vi.fn(),
  },
}));

function task(overrides: Partial<Task> = {}): Task {
  return {
    taskId: 'task-1',
    taskName: 'Diseño',
    taskDescription: 'Identidad visual',
    taskStatus: 'SEMI_COMPLETED' as Task['taskStatus'],
    taskOwner: 'client-1',
    taskAssignee: 'worker-1',
    creationDate: '2026-11-01T00:00:00Z',
    category: 'ARREGLOS',
    price: 50000,
    ownerApproval: true,
    assigneeApproval: true,
    paymentStatus: 'UNPAID',
    ...overrides,
  };
}

function renderCard(currentUserId: string, value = task()) {
  return render(
    <MemoryRouter>
      <EscrowActionCard task={value} currentUserId={currentUserId} />
    </MemoryRouter>,
  );
}

describe('EscrowActionCard', () => {
  beforeEach(() => {
    taskApi.getCompletionStatus.mockReset();
  });

  it('habilita el pago solo al cliente cuando la tarea está semi completada y sin pagar', () => {
    taskApi.getCompletionStatus.mockResolvedValue({ status: 'SEMI_COMPLETED' });
    renderCard('client-1');
    expect(screen.getByRole('button', { name: /pagar y asegurar en escrow/i })).toBeEnabled();
  });

  it('explica por qué el pago aún no está disponible', () => {
    taskApi.getCompletionStatus.mockResolvedValue({ status: 'ASSIGNED' });
    renderCard('client-1', task({ taskStatus: 'ASSIGNED', paymentStatus: 'UNPAID' }));
    expect(screen.getByRole('button', { name: /pagar y asegurar en escrow/i })).toBeDisabled();
    expect(screen.getByText(/cuando el prestador finalice su parte/i)).toBeInTheDocument();
  });

  it('no muestra el botón de pagar al prestador', () => {
    taskApi.getCompletionStatus.mockResolvedValue({ status: 'SEMI_COMPLETED' });
    renderCard('worker-1');
    expect(screen.queryByRole('button', { name: /pagar y asegurar/i })).not.toBeInTheDocument();
    expect(screen.getByText(/esperando que el cliente realice el pago/i)).toBeInTheDocument();
  });
});
