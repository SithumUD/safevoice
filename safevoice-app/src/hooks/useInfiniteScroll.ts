// src/hooks/useInfiniteScroll.ts
import { useCallback, useRef, useState } from 'react';
import { PageResponseDTO } from '../types/api';

type FetchFn<T> = (page: number) => Promise<PageResponseDTO<T>>;

interface UseInfiniteScrollOptions {
  pageSize?: number;
}

interface UseInfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteScroll<T>(
  fetchFn: FetchFn<T>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult<T> {
  const { pageSize = 20 } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = useRef(0);
  const isFetching = useRef(false);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setError(null);

      try {
        const result = await fetchFn(page);
        const newItems = result.content ?? [];

        if (append) {
          setData((prev) => [...prev, ...newItems]);
        } else {
          setData(newItems);
        }

        currentPage.current = page;
        setHasMore(result.hasNext ?? newItems.length >= pageSize);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load data');
      } finally {
        isFetching.current = false;
      }
    },
    [fetchFn, pageSize]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    const nextPage = currentPage.current + 1;
    setIsLoadingMore(true);
    fetchPage(nextPage, true).finally(() => setIsLoadingMore(false));
  }, [hasMore, isLoadingMore, isLoading, fetchPage]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    currentPage.current = 0;
    setHasMore(true);
    await fetchPage(0, false);
    setIsRefreshing(false);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setData([]);
    currentPage.current = 0;
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    isFetching.current = false;
  }, []);

  // Initial load
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    setIsLoading(true);
    fetchPage(0, false).finally(() => setIsLoading(false));
  }

  return { data, isLoading, isRefreshing, isLoadingMore, hasMore, error, loadMore, refresh, reset };
}
