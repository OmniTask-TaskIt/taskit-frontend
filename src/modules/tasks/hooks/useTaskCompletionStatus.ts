import { useCallback, useEffect, useRef, useState } from 'react';
import { taskService } from '../services/taskService';
import type { TaskCompletionStatus } from '../types/task.types';

export function useTaskCompletionStatus(taskId: string, currentUserId: string) {
  const [status, setStatus] = useState<TaskCompletionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (requestRef.current) return requestRef.current;
    const request = (async () => {
      setLoading(true);
      setError('');
      try {
        setStatus(await taskService.getCompletionStatus(taskId));
      } catch {
        setError('No se pudo cargar el estado de finalización.');
      } finally {
        setLoading(false);
        requestRef.current = null;
      }
    })();
    requestRef.current = request;
    return request;
  }, [taskId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const complete = useCallback(async () => {
    if (completing || !status || (status.ownerId === currentUserId ? status.ownerApproved : status.assigneeId === currentUserId ? status.assigneeApproved : false)) return;
    setCompleting(true);
    setError('');
    try {
      await taskService.completeTask(taskId, { userId: currentUserId });
      await load();
    } catch {
      setError('No se pudo aprobar la finalización. Intenta nuevamente.');
    } finally {
      setCompleting(false);
    }
  }, [completing, currentUserId, load, status, taskId]);

  return { status, loading, completing, error, retry: load, complete };
}
