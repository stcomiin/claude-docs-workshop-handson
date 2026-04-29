import type { IntelItem } from '../../lib/types';

const SEVERITY_BADGES: Record<string, string> = {
  info: 'bg-gray-700 text-gray-300',
  low: 'bg-blue-900/50 text-blue-300',
  medium: 'bg-amber-900/50 text-amber-300',
  high: 'bg-red-900/50 text-red-300',
  critical: 'bg-red-800/70 text-red-200 font-semibold',
};

export function TimelineItem({ item }: { item: IntelItem }) {
  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4 hover:border-surface-500 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-200 hover:text-accent-blue block"
          >
            {item.title}
          </a>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.content}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-500">{item.source_name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${SEVERITY_BADGES[item.severity]}`}>
              {item.severity}
            </span>
            {item.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue/20 text-accent-blue">
                {tag}
              </span>
            ))}
            {item.author && <span className="text-xs text-gray-600">by {item.author}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-gray-500">
            {new Date(item.published_at).toLocaleDateString()}
          </div>
          <div className="text-[10px] text-gray-600">
            {new Date(item.collected_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
