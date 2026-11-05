import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_WS_URL } from '../config/chatConfig';
import { chatService } from '../services/chatService';
import type { ChatMessage, ChatServerEvent } from '../types/chat.types';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 1200;

export function useChatSession(taskId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const historyRequestRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);

  const closeSocket = useCallback(() => {
    if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      closeSocket();
    };
  }, [closeSocket]);

  useEffect(() => {
    closeSocket();
    reconnectRef.current = 0;
    historyRequestRef.current = null;
    const resetTimer = window.setTimeout(() => {
      setMessages([]);
      setError(null);
      if (taskId && userId) setLoading(true);
    }, 0);
    if (!taskId || !userId) {
      return () => window.clearTimeout(resetTimer);
    }

    let active = true;
    const historyRequest = (async () => {
      try {
        const history = await chatService.getHistory(taskId);
        if (active) setMessages(history);
      } catch {
        if (active) setError('Ocurrió un problema al cargar el historial. Intenta nuevamente.');
      } finally {
        if (active) setLoading(false);
        historyRequestRef.current = null;
      }
    })();
    historyRequestRef.current = historyRequest;

    const connect = () => {
      if (!active || socketRef.current || !CHAT_WS_URL) return;
      // El WebSocket nativo del navegador no permite headers arbitrarios; el gateway debe derivar el usuario del contexto autenticado.
      const socket = new WebSocket(CHAT_WS_URL, ['taskit-chat', userId]);
      socketRef.current = socket;
      socket.onopen = () => {
        reconnectRef.current = 0;
        socket.send(JSON.stringify({ type: 'chat:EnterRoom', chatId: taskId }));
      };
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ChatServerEvent;
          if (payload.type === 'chat:history') setMessages(payload.messages ?? payload.data ?? []);
          if (payload.type === 'chat:newMessage') {
            const message = payload.message ?? payload.data;
            if (message) setMessages((current) => [...current, message]);
          }
          if (payload.type === 'error') setError(payload.message ?? payload.error ?? 'El chat devolvió un error.');
        } catch {
          setError('El chat devolvió una respuesta inválida.');
        }
      };
      socket.onerror = () => setError('No fue posible conectar con el chat.');
      socket.onclose = () => {
        socketRef.current = null;
        if (active && reconnectRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectRef.current += 1;
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();
    return () => {
      active = false;
      closeSocket();
    };
  }, [closeSocket, taskId, userId]);

  const sendMessage = useCallback((content: string) => {
    const clean = content.trim();
    if (!clean || !taskId || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return false;
    setSending(true);
    socketRef.current.send(JSON.stringify({ type: 'chat:sendMessage', chatId: taskId, messageId: crypto.randomUUID(), content: clean }));
    window.setTimeout(() => { if (mountedRef.current) setSending(false); }, 0);
    return true;
  }, [taskId]);

  return { messages, loading, sending, error, sendMessage, retry: () => { setError(null); } };
}
