import { useDashboardStore } from '../../stores/dashboard';

const SEVERITY_COLORS: Record<string, string> = {
  info: 'text-gray-400',
  low: 'text-accent-blue',
  medium: 'text-accent-amber',
  high: 'text-accent-red',
  critical: 'text-red-300 bg-red-900/30',
};

const SOURCE_COLORS: Record<string, string> = {
  news: 'bg-accent-blue',
  social: 'bg-accent-purple',
  technical: 'bg-accent-red',
  custom: 'bg-accent-amber',
};

export function ActivityFeed() {
  const { items } = useDashboardStore();

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Activity Feed</h3>
      <div className="flex-1 overflow-auto space-y-2">
        {items.slice(0, 50).map((item) => (
          <div key={item.id} className="flex items-start gap-2 p-2 rounded hover:bg-surface-700 transition-colors">
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SOURCE_COLORS[item.source_type] || 'bg-gray-500'}`} />
            <div className="min-w-0 flex-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-200 hover:text-accent-blue truncate block"
              >
                {item.title}
              </a>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{item.source_name}</span>
                <span className={`text-xs px-1 rounded ${SEVERITY_COLORS[item.severity]}`}>
                  {item.severity}
                </span>
                <span className="text-xs text-gray-600">
                  {new Date(item.collected_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <SentimentDot value={item.sentiment} />
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">No items yet. Configure collectors in Settings.</div>
        )}
      </div>
    </div>
  );
}

function SentimentDot({ value }: { value: number }) {
  const color = value > 0.1 ? 'bg-accent-green' : value < -0.1 ? 'bg-accent-red' : 'bg-gray-500';
  return <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${color}`} title={`Sentiment: ${value.toFixed(2)}`} />;
}
