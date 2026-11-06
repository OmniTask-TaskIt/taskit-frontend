import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatService } from './chatService';

vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../config/chatConfig', () => ({
  CHAT_API_BASE: 'https://chat.test/api/v1',
  assertChatConfigured: vi.fn(),
}));

describe('chatService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista chats con el usuario autenticado', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [{ taskId: 'task-1' }] });
    await expect(chatService.listChats('user-1')).resolves.toEqual([{ taskId: 'task-1' }]);
    expect(axios.get).toHaveBeenCalledWith('https://chat.test/api/v1/chats', { params: { userId: 'user-1' } });
  });

  it('consulta el historial de una tarea', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { messages: [{ messageId: 'm-1' }] } });
    await expect(chatService.getHistory('task-1')).resolves.toEqual([{ messageId: 'm-1' }]);
    expect(axios.get).toHaveBeenCalledWith('https://chat.test/api/v1/chats/messages', { params: { taskId: 'task-1' } });
  });

  it('envía un mensaje con el contrato del microservicio', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { messageId: 'm-2', content: 'Hola' } });
    await expect(chatService.sendMessage('task-1', { messageId: 'm-2', content: 'Hola' })).resolves.toEqual({ messageId: 'm-2', content: 'Hola' });
    expect(axios.post).toHaveBeenCalledWith('https://chat.test/api/v1/chats/message', { taskId: 'task-1', messageId: 'm-2', content: 'Hola' });
  });

  it('rechaza respuestas de listado que no son arreglos', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { error: 'request failed' } });
    await expect(chatService.listChats('user-1')).rejects.toThrow('lista válida');
  });
});
