import { useDashboardStore } from '../../stores/dashboard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap() {
  const { stats } = useDashboardStore();
  const hourly = stats?.hourly_activity || [];

  const maxCount = Math.max(1, ...hourly.map((h) => h.count));
  const lookup = new Map(hourly.map((h) => [`${h.day}-${h.hour}`, h.count]));

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
          <div />
          {HOURS.map((h) => (
            <div key={h} className="text-[9px] text-gray-500 text-center">
              {h}
            </div>
          ))}
          {DAYS.map((day, dayIdx) => (
            <div key={`row-${day}`} className="contents">
              <div className="text-[10px] text-gray-500 flex items-center">
                {day}
              </div>
              {HOURS.map((hour) => {
                const count = lookup.get(`${dayIdx}-${hour}`) || 0;
                const intensity = count / maxCount;
                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: count > 0 ? `rgba(59, 130, 246, ${0.15 + intensity * 0.85})` : 'rgba(255,255,255,0.03)',
                    }}
                    title={`${day} ${hour}:00 — ${count} items`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
