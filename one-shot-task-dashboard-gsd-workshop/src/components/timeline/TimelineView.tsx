import { useDashboardStore } from '../../stores/dashboard';
import { FilterBar } from './FilterBar';
import { TimelineItem } from './TimelineItem';

export function TimelineView() {
  const { items } = useDashboardStore();

  return (
    <div className="h-full flex flex-col">
      <FilterBar />
      <div className="flex-1 overflow-auto space-y-2">
        {items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-16">
            No items match your filters. Try adjusting the filters or configure collectors in Settings.
          </div>
        )}
      </div>
    </div>
  );
}
