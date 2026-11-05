import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chatService';
import type { ChatSummary } from '../types/chat.types';

export function useChats(userId: string | null) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setChats([]);
      setError('No se encontró una identidad de usuario para cargar los chats.');
      setLoading(false);
      return;
    }
    if (requestRef.current) return requestRef.current;
    const request = (async () => {
      setLoading(true);
      setError(null);
      try {
        setChats(await chatService.listChats(userId));
      } catch {
        setError('Ocurrió un problema al cargar los chats. Intenta nuevamente.');
      } finally {
        setLoading(false);
        requestRef.current = null;
      }
    })();
    requestRef.current = request;
    return request;
  }, [userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { chats, loading, error, reload: load };
}
