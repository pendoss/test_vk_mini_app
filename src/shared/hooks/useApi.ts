import { useState, useCallback, useEffect } from 'react';
import { getApiErrorMessage } from '@/shared/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  cacheTime?: number;
}

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
}

// Базовый хук для API запросов
export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction(...args);
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const refetch = useCallback(async () => {
    return execute();
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}

// Хук для мутаций (POST, PUT, DELETE)
export function useMutation<T>(
  mutationFunction: (...args: any[]) => Promise<T>,
  options?: UseMutationOptions<T>
): UseApiResult<T> {
  const { execute, ...rest } = useApi(mutationFunction);

  const mutate = useCallback(async (...args: any[]) => {
    const result = await execute(...args);
    
    if (result) {
      options?.onSuccess?.(result);
    } else if (rest.error) {
      options?.onError?.(rest.error);
    }
    
    options?.onSettled?.();
    return result;
  }, [execute, options, rest.error]);

  return {
    ...rest,
    execute: mutate,
    reset: rest.reset,
    refetch: rest.refetch,
  };
}

// Хук для запросов с автоматической загрузкой (GET)
export function useQuery<T>(
  queryFunction: () => Promise<T>,
  options: UseQueryOptions = {}
): UseApiResult<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const { execute, ...rest } = useApi(queryFunction);

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (enabled && refetchOnMount) {
      execute();
    }
  }, [enabled, refetchOnMount, execute]);

  // Кэширование (базовая реализация)
  useEffect(() => {
    if (rest.data && cacheTime > 0) {
      const timeoutId = setTimeout(() => {
        rest.reset();
      }, cacheTime);

      return () => clearTimeout(timeoutId);
    }
  }, [rest.data, cacheTime, rest.reset]);

  return {
    ...rest,
    execute,
    refetch: execute,
  };
}

// Хук для пагинации
export function usePaginatedQuery<T>(
  queryFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  initialPage = 1,
  limit = 10
) {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { execute, loading, error } = useApi(queryFunction);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const result = await execute(page, limit);
    if (result) {
      setAllData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    }
  }, [execute, page, limit, loading, hasMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
  }, [initialPage]);

  const refresh = useCallback(async () => {
    reset();
    const result = await execute(initialPage, limit);
    if (result) {
      setAllData(result.data);
      setHasMore(result.hasMore);
      setPage(initialPage + 1);
    }
  }, [execute, initialPage, limit, reset]);

  // Автоматическая загрузка первой страницы
  useEffect(() => {
    refresh();
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    reset,
  };
}
