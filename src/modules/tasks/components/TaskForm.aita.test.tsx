import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import { aitaService } from '../../aita/services/aita.service';
import type { TaskFormValues } from '../types/task.types';

vi.mock('../../aita/services/aita.service', () => ({
  aitaService: {
    generateDescription: vi.fn(),
    estimatePrice: vi.fn(),
    analyzeShield: vi.fn(),
  },
}));

const value: TaskFormValues = { title: '', description: '', price: '', category: 'ARREGLOS' };

describe('TaskForm con AITA', () => {
  it('rellena título y descripción a partir de una idea', async () => {
    vi.mocked(aitaService.generateDescription).mockResolvedValueOnce({
      title: 'Reparar fuga',
      description: 'Hay una fuga bajo el lavaplatos y se necesita un técnico.',
    });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm value={value} onChange={onChange} onCancel={vi.fn()} onSubmit={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/arreglar una fuga/i), 'Fuga bajo el lavaplatos');
    await user.click(screen.getByRole('button', { name: /generar descripción/i }));

    expect(aitaService.generateDescription).toHaveBeenCalledWith({ idea: 'Fuga bajo el lavaplatos' }, undefined);
    expect(onChange).toHaveBeenCalledWith({
      ...value,
      title: 'Reparar fuga',
      description: 'Hay una fuga bajo el lavaplatos y se necesita un técnico.',
    });
  });

  it('si la idea es demasiado corta no llama a la IA y deja el formulario editable', async () => {
    const user = userEvent.setup();
    render(<TaskForm value={value} onChange={vi.fn()} onCancel={vi.fn()} onSubmit={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/arreglar una fuga/i), 'ab');
    await user.click(screen.getByRole('button', { name: /generar descripción/i }));

    expect(aitaService.generateDescription).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 3 caracteres/i);
    expect(screen.getByLabelText('Descripción')).toBeEnabled();
  });

  it('estima el precio y propone el punto medio del rango', async () => {
    vi.mocked(aitaService.estimatePrice).mockResolvedValueOnce({
      min_price: 80000,
      max_price: 120000,
      currency: 'COP',
      confidence: 0.8,
      rationale: 'Precio habitual en la ciudad.',
    });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskForm
        value={{ ...value, description: 'Cambiar el grifo de la cocina este fin de semana' }}
        onChange={onChange}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByPlaceholderText(/bogotá/i), 'Bogotá');
    await user.click(screen.getByRole('button', { name: /estimar precio sugerido/i }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ price: '100000' }));
    expect(await screen.findByText(/precio habitual en la ciudad/i)).toBeInTheDocument();
  });
});
