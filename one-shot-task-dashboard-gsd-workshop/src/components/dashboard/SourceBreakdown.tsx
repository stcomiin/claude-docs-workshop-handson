import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardStore } from '../../stores/dashboard';

const COLORS = { news: '#3b82f6', social: '#a855f7', technical: '#ef4444', custom: '#f59e0b' };

export function SourceBreakdown() {
  const { stats } = useDashboardStore();
  const data = Object.entries(stats?.source_counts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Sources</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || '#666'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #222230', borderRadius: '6px' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-gray-500 text-sm text-center py-8">No source data</div>
      )}
    </div>
  );
}
