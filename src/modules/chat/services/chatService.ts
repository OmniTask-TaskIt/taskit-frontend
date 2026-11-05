import axios from 'axios';
import { authStore } from '../../authentication/services/authStore';
import { assertChatConfigured, CHAT_API_BASE } from '../config/chatConfig';
import type { ChatMessage, ChatSummary } from '../types/chat.types';

function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'data' in data) return (data as { data: T }).data;
  return data as T;
}

export const chatService = {
  async listChats(userId: string): Promise<ChatSummary[]> {
    assertChatConfigured();
    const response = await axios.get(`${CHAT_API_BASE}/chats`, { params: { userId } });
    return unwrap<ChatSummary[]>(response.data) ?? [];
  },

  async getHistory(taskId: string): Promise<ChatMessage[]> {
    assertChatConfigured();
    const response = await axios.get(`${CHAT_API_BASE}/chats/messages`, { params: { taskId } });
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
