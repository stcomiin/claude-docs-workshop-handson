import { useEffect } from 'react';
import { useDashboardStore } from '../stores/dashboard';
import { api } from '../lib/api';

export function useItems() {
  const { setItems, filters } = useDashboardStore();

  useEffect(() => {
    const params: Record<string, string> = { limit: '100' };
    if (filters.source_type) params.source_type = filters.source_type;
    if (filters.severity) params.severity = filters.severity;

    if (filters.search) {
      api.searchItems(filters.search).then(setItems).catch(() => {});
    } else {
      api.getItems(params).then((r) => setItems(r.items)).catch(() => {});
    }
  }, [filters.source_type, filters.severity, filters.search, setItems]);
}
