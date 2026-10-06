import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileActivity from './ProfileActivity';

describe('ProfileActivity (RF-AUTHPR-8)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 6, 12, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('muestra las tareas completadas y la antigüedad', () => {
    render(<ProfileActivity tasksCompleted={12} memberSince={new Date(2026, 6, 6, 12).toISOString()} />);

    expect(screen.getByText('12 tareas completadas')).toBeInTheDocument();
    expect(screen.getByText(/miembro desde julio de 2026/i)).toHaveTextContent('3 meses');
  });

  it('usa el singular con una sola tarea', () => {
    render(<ProfileActivity tasksCompleted={1} />);

    expect(screen.getByText('1 tarea completada')).toBeInTheDocument();
  });

  it('muestra 0 tareas cuando el backend aún no envía el dato', () => {
    render(<ProfileActivity />);

    expect(screen.getByText('0 tareas completadas')).toBeInTheDocument();
    expect(screen.queryByText(/miembro desde/i)).not.toBeInTheDocument();
  });

  it('omite la antigüedad si la fecha no es válida', () => {
    render(<ProfileActivity tasksCompleted={3} memberSince="no-es-una-fecha" />);

    expect(screen.getByText('3 tareas completadas')).toBeInTheDocument();
    expect(screen.queryByText(/miembro desde/i)).not.toBeInTheDocument();
  });
});
