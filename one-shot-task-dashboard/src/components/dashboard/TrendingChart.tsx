import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStore } from '../../stores/dashboard';

export function TrendingChart() {
  const { stats } = useDashboardStore();
  const data = stats?.trending_keywords.slice(0, 10) || [];

  return (
    <div className="bg-surface-800 rounded-lg border border-surface-600 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Trending Keywords (24h)</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" stroke="#666" fontSize={10} />
            <YAxis type="category" dataKey="keyword" stroke="#666" fontSize={10} width={55} />
            <Tooltip
              contentStyle={{ background: '#1a1a25', border: '1px solid #222230', borderRadius: '6px' }}
              labelStyle={{ color: '#e5e7eb' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-gray-500 text-sm text-center py-8">No trending data</div>
      )}
    </div>
  );
}
