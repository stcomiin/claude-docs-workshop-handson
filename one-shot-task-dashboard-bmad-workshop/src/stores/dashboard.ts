import { create } from 'zustand';
import type { IntelItem, DashboardStats } from '../lib/types';

interface DashboardState {
  items: IntelItem[];
  stats: DashboardStats | null;
  connected: boolean;
  activeView: 'dashboard' | 'timeline' | 'settings';
  filters: {
    source_type: string | null;
    severity: string | null;
    search: string;
  };
  setView: (view: DashboardState['activeView']) => void;
  setFilter: (key: string, value: string | null) => void;
  setSearch: (search: string) => void;
  addItem: (item: IntelItem) => void;
  setItems: (items: IntelItem[]) => void;
  setStats: (stats: DashboardStats) => void;
  setConnected: (connected: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  items: [],
  stats: null,
  connected: false,
  activeView: 'dashboard',
  filters: { source_type: null, severity: null, search: '' },
  setView: (activeView) => set({ activeView }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  addItem: (item) =>
    set((state) => ({ items: [item, ...state.items].slice(0, 500) })),
  setItems: (items) => set({ items }),
  setStats: (stats) => set({ stats }),
  setConnected: (connected) => set({ connected }),
}));
