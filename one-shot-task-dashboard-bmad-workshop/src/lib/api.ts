import type { IntelItem, DashboardStats, Watchlist, CollectorConfig } from './types';

const BASE = '/api';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getItems: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ items: IntelItem[]; total: number }>(`/items${qs}`);
  },
  searchItems: (q: string) => request<IntelItem[]>(`/items/search?q=${encodeURIComponent(q)}`),
  getStats: () => request<DashboardStats>('/stats'),
  getWatchlists: () => request<Watchlist[]>('/watchlists'),
  createWatchlist: (data: Partial<Watchlist>) => request<Watchlist>('/watchlists', { method: 'POST', body: JSON.stringify(data) }),
  updateWatchlist: (id: string, data: Partial<Watchlist>) => request<Watchlist>(`/watchlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWatchlist: (id: string) => request<void>(`/watchlists/${id}`, { method: 'DELETE' }),
  getCollectors: () => request<CollectorConfig[]>('/collectors'),
  createCollector: (data: Partial<CollectorConfig>) => request<CollectorConfig>('/collectors', { method: 'POST', body: JSON.stringify(data) }),
  updateCollector: (id: string, data: Partial<CollectorConfig>) => request<CollectorConfig>(`/collectors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCollector: (id: string) => request<void>(`/collectors/${id}`, { method: 'DELETE' }),
  testCollector: (id: string) => request<{ status: string; message: string }>(`/collectors/${id}/test`, { method: 'POST' }),
};
