import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../stores/dashboard';

export function useWebSocket() {
  const { addItem, setStats, setConnected } = useDashboardStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let delay = 1000;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        delay = 1000;
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_item') addItem(msg.data);
        if (msg.type === 'stats_update') setStats(msg.data);
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout = setTimeout(() => {
          delay = Math.min(delay * 2, 30000);
          connect();
        }, delay);
      };
    }

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [addItem, setStats, setConnected]);
}
