import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";

interface UsePolledResourceOptions {
  /** Re-fetch on this interval. Pass null/undefined to fetch once. */
  intervalMs?: number | null;
  /** Effect re-runs (and state resets) when any of these change. */
  deps?: unknown[];
}

interface UsePolledResource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePolledResource<T>(
  fetcher: () => Promise<T>,
  { intervalMs = null, deps = [] }: UsePolledResourceOptions = {},
): UsePolledResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  // Bumped whenever the resource changes (deps change / unmount) so a slow, superseded
  // request can't overwrite state with stale data after a newer request has resolved.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const result = await fetcherRef.current();
      if (requestId !== requestIdRef.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof ApiError ? err.message : "Failed to load data.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setData(null);
    setError(null);
    setLoading(true);
    load();
    if (!intervalMs) return;
    const id = setInterval(load, intervalMs);
    return () => {
      clearInterval(id);
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: load };
}
