import { useCallback, useEffect, useRef, useState } from 'react';
import { AitaRequestError, isAbortError, toAitaRequestError } from '../services/aitaError';

type RequestFn<TArgs, TResult> = (args: TArgs, signal?: AbortSignal) => Promise<TResult>;

export function useAitaRequest<TArgs, TResult>(request: RequestFn<TArgs, TResult>) {
  const requestRef = useRef(request);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  const execute = useCallback(async (args: TArgs, signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestRef.current(args, signal);
      const stale = !mountedRef.current || requestId !== requestIdRef.current || signal?.aborted;
      if (stale) return null;
      setData(result);
      return result;
    } catch (caught) {
      const stale = !mountedRef.current || requestId !== requestIdRef.current || signal?.aborted || isAbortError(caught);
      if (stale) return null;
      const message = caught instanceof AitaRequestError ? caught.message : toAitaRequestError(caught).message;
      setError(message);
      return null;
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  return { isLoading, error, data, execute, reset };
}
