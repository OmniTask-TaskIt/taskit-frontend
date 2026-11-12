import { env } from '../../authentication/Config/env';

/** La generación con IA suele tardar varios segundos; 45s evita cortes prematuros. */
export const AITA_TIMEOUT_MS = 45_000;

export const AITA_CONFIG_ERROR =
  'VITE_AITA_API_URL no está configurada. Define la URL del microservicio AITA.';

const configuredBase = env.aitaApiUrl.trim().replace(/\/+$/, '');

export const AITA_API_BASE = configuredBase;

if (!configuredBase && import.meta.env.DEV) {
  console.error(`[TaskIt] ${AITA_CONFIG_ERROR}`);
}
