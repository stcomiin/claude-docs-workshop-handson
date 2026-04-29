import { useDashboardStore } from '../../stores/dashboard';
import { useState } from 'react';

const SOURCE_TYPES = [
  { value: null, label: 'All Sources' },
  { value: 'news', label: 'News' },
  { value: 'social', label: 'Social' },
  { value: 'technical', label: 'Technical' },
  { value: 'custom', label: 'Custom' },
];

const SEVERITIES = [
  { value: null, label: 'All Severities' },
  { value: 'info', label: 'Info' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function FilterBar() {
  const { filters, setFilter, setSearch } = useDashboardStore();
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <div className="flex gap-1">
        {SOURCE_TYPES.map((st) => (
          <button
            key={st.value ?? 'all'}
            onClick={() => setFilter('source_type', st.value)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              filters.source_type === st.value
                ? 'bg-accent-blue text-white'
                : 'bg-surface-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
      <select
        value={filters.severity || ''}
        onChange={(e) => setFilter('severity', e.target.value || null)}
        className="bg-surface-700 text-gray-300 text-xs rounded px-2 py-1 border border-surface-600"
      >
        {SEVERITIES.map((s) => (
          <option key={s.value ?? 'all'} value={s.value || ''}>
            {s.label}
          </option>
        ))}
      </select>
      <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-surface-700 text-gray-200 text-sm rounded px-3 py-1.5 border border-surface-600 placeholder-gray-500 focus:outline-none focus:border-accent-blue"
        />
      </form>
    </div>
  );
}
