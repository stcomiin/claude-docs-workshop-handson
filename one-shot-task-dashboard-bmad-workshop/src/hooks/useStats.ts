import { useEffect } from 'react';
import { useDashboardStore } from '../stores/dashboard';
import { api } from '../lib/api';

export function useStats() {
  const { setStats } = useDashboardStore();

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    const interval = setInterval(() => {
      api.getStats().then(setStats).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [setStats]);
}
