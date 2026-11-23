/**
 * Reto del segundo factor (RF-AUTH-9). Cuando el login responde `twoFactorRequired`, el challengeId y el correo se
 * guardan en sessionStorage (mueren al cerrar la pestaña) y la pantalla /verify-2fa los usa para pedir el código.
 */
import { sanitizeEmail, sanitizeId } from './storageSanitizers';

const ID_KEY = 'twoFactorChallengeId';
const EMAIL_KEY = 'twoFactorChallengeEmail';

export interface TwoFactorChallenge {
  challengeId: string;
  email: string;
}

export const twoFactorChallenge = {
  /** Valida el reto antes de guardarlo; con un challengeId inválido no guarda nada y devuelve false. */
  start(challenge: TwoFactorChallenge): boolean {
    const challengeId = sanitizeId(challenge.challengeId);
    if (!challengeId) return false;
    sessionStorage.setItem(ID_KEY, challengeId);

    const email = sanitizeEmail(challenge.email);
    if (email) {
      sessionStorage.setItem(EMAIL_KEY, email);
    } else {
      sessionStorage.removeItem(EMAIL_KEY);
    }
    return true;
  },

  get(): TwoFactorChallenge | null {
    const challengeId = sessionStorage.getItem(ID_KEY);
    if (!challengeId) return null;
    return { challengeId, email: sessionStorage.getItem(EMAIL_KEY) ?? '' };
  },

  clear() {
    sessionStorage.removeItem(ID_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
  },
};
