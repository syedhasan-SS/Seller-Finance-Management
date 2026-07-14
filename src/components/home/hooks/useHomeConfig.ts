import { useEffect, useState } from 'react';
import type { HomeConfig } from '@/types/homeConfig';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface UseHomeConfigResult {
  data: HomeConfig | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Fetches the seller's HomeConfig from the backend. Matches the useState + fetch
 * pattern used in Dashboard.tsx — keeps the v1 build dep-free (TanStack Query
 * is imported elsewhere in the repo but missing from package.json).
 */
export function useHomeConfig(vendorId: string | null): UseHomeConfigResult {
  const [data, setData] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/sellers/${vendorId}/home-config`, {
      headers: getAuthHeaders(),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          throw new Error('Session expired');
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed: ${res.status}`);
        }
        return res.json() as Promise<HomeConfig>;
      })
      .then((cfg) => setData(cfg))
      .catch((e: unknown) => {
        if ((e as { name?: string })?.name === 'AbortError') return;
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [vendorId, refreshTick]);

  return { data, loading, error, refresh: () => setRefreshTick((t) => t + 1) };
}
