export type ChatRole = 'SEEKER' | 'PROVIDER';

export interface ChatSummary {
  chatId: string;
  taskId: string;
  sellerId: string;
  buyerId: string;
  status: string;
}

export interface ChatMessage {
  messageId?: string;
  chatId?: string;
  senderId: string;
  content: string;
  createdAt?: string;
}

export type ChatServerEvent =
  | { type: 'chat:history'; messages?: ChatMessage[]; data?: ChatMessage[] }
  | { type: 'chat:newMessage'; message?: ChatMessage; data?: ChatMessage }
  | { type: 'error'; message?: string; error?: string };
