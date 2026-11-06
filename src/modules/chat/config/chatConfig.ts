import { env } from '../../authentication/Config/env';

const normalizedBase = env.chatApiUrl.trim().replace(/\/+$/, '');

export const CHAT_API_BASE = normalizedBase ? `${normalizedBase}/api/v1` : '';
export const CHAT_WS_URL = normalizedBase
  ? `${normalizedBase.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://')}/ws/chat`
  : '';
export const CHAT_CONFIG_ERROR = 'VITE_CHAT_API_URL no está configurada. Configura la URL del microservicio de chat.';

export function assertChatConfigured(): void {
  if (!CHAT_API_BASE || !CHAT_WS_URL) throw new Error(CHAT_CONFIG_ERROR);
}
