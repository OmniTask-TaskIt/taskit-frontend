/**
 * Reto del segundo factor (RF-AUTH-9). Cuando el login responde `twoFactorRequired`, el challengeId y el correo se
 * guardan en sessionStorage (mueren al cerrar la pestaña) y la pantalla /verify-2fa los usa para pedir el código.
 */
import { sanitizeEmail, sanitizeId } from './storageSanitizers';

const KEY = 'twoFactorChallenge';

export interface TwoFactorChallenge {
  challengeId: string;
  email: string;
}

export const twoFactorChallenge = {
  /** Valida el reto antes de guardarlo; con un challengeId inválido no guarda nada y devuelve false. */
  start(challenge: TwoFactorChallenge): boolean {
    const challengeId = sanitizeId(challenge.challengeId);
    if (!challengeId) return false;
    const email = sanitizeEmail(challenge.email) ?? '';
    sessionStorage.setItem(KEY, JSON.stringify({ challengeId, email }));
    return true;
  },

  get(): TwoFactorChallenge | null {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Partial<TwoFactorChallenge> | null;
      return parsed?.challengeId ? { challengeId: parsed.challengeId, email: parsed.email ?? '' } : null;
    } catch {
      return null;
    }
  },

  clear() {
    sessionStorage.removeItem(KEY);
  },
};
