import { useDashboardStore } from '../../stores/dashboard';

export function Header() {
  const { connected, stats } = useDashboardStore();

  return (
    <header className="h-12 bg-surface-800 border-b border-surface-600 flex items-center justify-between px-4">
      <h1 className="text-sm font-semibold text-gray-200">OSINT Monitor</h1>
      <div className="flex items-center gap-4 text-xs">
        {stats && (
          <span className="text-gray-400">
            {stats.total_items} items | {stats.items_last_24h} last 24h
          </span>
        )}
        <span className={`flex items-center gap-1 ${connected ? 'text-accent-green' : 'text-accent-red'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-green' : 'bg-accent-red'}`} />
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
}
