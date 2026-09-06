/**
 * usePaginatedFetch — server-side pagination helper
 *
 * Usage:
 *   const { data, total, page, totalPages, loading, setPage, refresh } =
 *     usePaginatedFetch('/master/contacts', 20);
 */
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string;
  setPage: (p: number) => void;
  refresh: () => void;
}

export function usePaginatedFetch<T = any>(
  endpoint: string,
  limit = 20,
  extraParams: Record<string, string> = {}
): PaginatedResult<T> {
  const [data, setData]           = useState<T[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPageState]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [tick, setTick]           = useState(0);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), ...extraParams });
      const separator = endpoint.includes('?') ? '&' : '?';
      const res = await apiFetch(`${endpoint}${separator}${params.toString()}`);
      // Support both paginated envelope and plain array (fallback safety)
      if (Array.isArray(res)) {
        setData(res);
        setTotal(res.length);
        setTotalPages(1);
      } else {
        setData(res?.data ?? []);
        setTotal(res?.total ?? 0);
        setTotalPages(res?.totalPages ?? 1);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, limit, tick, JSON.stringify(extraParams)]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const setPage = (p: number) => setPageState(p);
  const refresh  = () => { setTick(t => t + 1); };

  return { data, total, page, totalPages, loading, error, setPage, refresh };
}
