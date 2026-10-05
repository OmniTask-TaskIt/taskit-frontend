import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReasonPromptModal from './ReasonPromptModal';

describe('ReasonPromptModal', () => {
  it('no llama a onConfirm si el motivo es obligatorio y está vacío', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ReasonPromptModal title="Bloquear usuario" confirmLabel="Confirmar" onConfirm={onConfirm} onClose={() => {}} />
    );

    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText(/es obligatorio/i)).toBeInTheDocument();
  });

  it('llama a onConfirm con el motivo escrito cuando es válido', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ReasonPromptModal title="Suspender usuario" confirmLabel="Confirmar" onConfirm={onConfirm} onClose={() => {}} />
    );

    await user.type(screen.getByRole('textbox'), 'Incumplimiento reiterado');
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(onConfirm).toHaveBeenCalledWith('Incumplimiento reiterado');
  });

  it('permite confirmar sin motivo cuando requireReason es false', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ReasonPromptModal
        title="Reactivar usuario"
        confirmLabel="Reactivar"
        requireReason={false}
        onConfirm={onConfirm}
        onClose={() => {}}
      />
    );

    await user.click(screen.getByRole('button', { name: /reactivar/i }));

    expect(onConfirm).toHaveBeenCalledWith('');
  });
});
