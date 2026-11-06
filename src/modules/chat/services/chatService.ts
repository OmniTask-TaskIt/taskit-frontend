import axios from 'axios';
import { authStore } from '../../authentication/services/authStore';
import { assertChatConfigured, CHAT_API_BASE } from '../config/chatConfig';
import type { ChatMessage, ChatSummary } from '../types/chat.types';

function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in data) return (data as { data: T }).data;
  return data as T;
}

function requireArray<T>(data: unknown, message: string): T[] {
  const body = unwrap<unknown>(data);
  if (!Array.isArray(body)) throw new Error(message);
  return body as T[];
}

export const chatService = {
  async listChats(userId: string): Promise<ChatSummary[]> {
    assertChatConfigured();
    const url = `${CHAT_API_BASE}/chats`;
    console.info('[chat][HTTP][listChats] GET', url, { userId });
    try {
      const response = await axios.get(url, { params: { userId } });
      console.info('[chat][HTTP][listChats] response', response.status, response.data);
      return requireArray<ChatSummary>(response.data, 'La API de chats no devolvió una lista válida.');
    } catch (error) {
      console.error('[chat][HTTP][listChats] failed', error);
      throw error;
    }
  },

  async getHistory(taskId: string): Promise<ChatMessage[]> {
    assertChatConfigured();
    const url = `${CHAT_API_BASE}/chats/messages`;
    console.info('[chat][HTTP][getHistory] GET', url, { taskId });
    const response = await axios.get(url, { params: { taskId } });
    console.info('[chat][HTTP][getHistory] response', response.status, response.data);
    const body = unwrap<ChatMessage[] | { messages?: ChatMessage[] }>(response.data);
    return Array.isArray(body) ? body : body?.messages ?? [];
  },

  async sendMessage(taskId: string, message: Pick<ChatMessage, 'messageId' | 'content'>): Promise<ChatMessage> {
    assertChatConfigured();
    const response = await axios.post(`${CHAT_API_BASE}/chats/message`, { taskId, ...message });
    return unwrap<ChatMessage>(response.data);
  },

  getIdentity(): string | null {
    return authStore.getUserId() ?? authStore.getEmail();
  },
};
