/**
 * Reto del segundo factor (RF-AUTH-9). Cuando el login responde `twoFactorRequired`, el challengeId y el correo se
 * guardan en sessionStorage (mueren al cerrar la pestaña) y la pantalla /verify-2fa los usa para pedir el código.
 */
const KEY = 'twoFactorChallenge';

export interface TwoFactorChallenge {
  challengeId: string;
  email: string;
}

export const twoFactorChallenge = {
  start(challenge: TwoFactorChallenge) {
    sessionStorage.setItem(KEY, JSON.stringify(challenge));
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
