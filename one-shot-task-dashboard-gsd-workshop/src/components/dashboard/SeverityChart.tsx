import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboardStore } from '../../stores/dashboard';

const SEVERITY_COLORS: Record<string, string> = {
  info: '#6b7280', low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626',
};

export function SeverityChart() {
  const { stats } = useDashboardStore();
  const order = ['info', 'low', 'medium', 'high', 'critical'];
  const data = order.map((sev) => ({
    severity: sev,
    count: stats?.severity_counts[sev] || 0,
    fill: SEVERITY_COLORS[sev],
  }));

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Severity Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="severity" stroke="#666" fontSize={10} />
          <YAxis stroke="#666" fontSize={10} />
          <Tooltip contentStyle={{ background: '#1a1a25', border: '1px solid #222230', borderRadius: '6px' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.severity} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
