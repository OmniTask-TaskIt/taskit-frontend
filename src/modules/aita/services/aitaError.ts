import axios from 'axios';

/** Error ya traducido para la interfaz. El usuario nunca debería ver un 500 crudo. */
export class AitaRequestError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AitaRequestError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED');
}

function validationMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const detail = (data as { detail?: unknown }).detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (!Array.isArray(detail)) return null;

  const parts = detail
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const record = item as { loc?: unknown; msg?: unknown };
      const loc = Array.isArray(record.loc) ? record.loc.map(String) : [];
      const field = loc.filter((part) => part !== 'body').at(-1) ?? '';
      const msg = typeof record.msg === 'string' ? record.msg : '';
      return [field, msg].filter(Boolean).join(': ');
    })
    .filter(Boolean);

  return parts.length > 0 ? `Revisa los datos. ${parts.join(' ')}` : null;
}

export function toAitaRequestError(error: unknown): AitaRequestError {
  if (error instanceof AitaRequestError) return error;
  if (isAbortError(error)) return new AitaRequestError('La solicitud se canceló.');

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new AitaRequestError('La IA está tardando más de lo habitual. Intenta de nuevo.');
    }
    if (!error.response) {
      return new AitaRequestError('La IA está descansando, intenta de nuevo.');
    }

    const status = error.response.status;
    if (status === 422) {
      return new AitaRequestError(
        validationMessage(error.response.data) ?? 'Revisa los datos e inténtalo de nuevo.',
        status,
      );
    }
    if (status >= 500) {
      return new AitaRequestError('La IA está descansando, intenta de nuevo.', status);
    }
    return new AitaRequestError('No pudimos completar la solicitud de AITA. Puedes continuar a mano.', status);
  }

  return new AitaRequestError('No pudimos completar la solicitud de AITA. Puedes continuar a mano.');
}
