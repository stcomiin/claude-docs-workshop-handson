import { ActivityFeed } from './ActivityFeed';
import { TrendingChart } from './TrendingChart';
import { SourceBreakdown } from './SourceBreakdown';
import { SeverityChart } from './SeverityChart';
import { ActivityHeatmap } from './ActivityHeatmap';

export function DashboardView() {
  return (
    <div className="grid grid-cols-3 gap-4 h-full auto-rows-min">
      <div className="col-span-2 row-span-3 min-h-0">
        <ActivityFeed />
      </div>
      <TrendingChart />
      <SourceBreakdown />
      <SeverityChart />
      <div className="col-span-3">
        <ActivityHeatmap />
      </div>
    </div>
  );
}
