import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { CollectorConfig } from '../../lib/types';

const COLLECTOR_TYPES = ['rss', 'twitter', 'reddit', 'cve', 'webhook'] as const;

const DEFAULT_CONFIGS: Record<string, Record<string, unknown>> = {
  rss: { urls: [] },
  twitter: { bearer_token: '', query: '' },
  reddit: { subreddits: [] },
  cve: { apiKey: '' },
  webhook: {},
};

export function CollectorManager() {
  const [collectors, setCollectors] = useState<CollectorConfig[]>([]);
  const [editing, setEditing] = useState<Partial<CollectorConfig> | null>(null);

  useEffect(() => {
    api.getCollectors().then(setCollectors).catch(() => {});
  }, []);

  const refresh = () => api.getCollectors().then(setCollectors);

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) {
      await api.updateCollector(editing.id, editing);
    } else {
      await api.createCollector(editing);
    }
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await api.deleteCollector(id);
    await refresh();
  };

  const handleToggle = async (col: CollectorConfig) => {
    await api.updateCollector(col.id, { enabled: !col.enabled });
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Collectors</h3>
        <button
          onClick={() => setEditing({ type: 'rss', name: '', interval_seconds: 300, config: { urls: [] } })}
          className="text-xs bg-accent-blue text-white px-3 py-1 rounded hover:bg-accent-blue/80"
        >
          + Add
        </button>
      </div>

      {editing && (
        <div className="bg-surface-700 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={editing.type || 'rss'}
              onChange={(e) => {
                const type = e.target.value as CollectorConfig['type'];
                setEditing({ ...editing, type, config: DEFAULT_CONFIGS[type] });
              }}
              className="bg-surface-800 text-gray-300 text-sm rounded px-2 py-1 border border-surface-600"
            >
              {COLLECTOR_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
            <input
              type="text"
              value={editing.name || ''}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Collector name"
              className="flex-1 bg-surface-800 text-gray-200 text-sm rounded px-2 py-1 border border-surface-600"
            />
          </div>
          <input
            type="number"
            value={editing.interval_seconds || 300}
            onChange={(e) => setEditing({ ...editing, interval_seconds: parseInt(e.target.value) })}
            placeholder="Interval (seconds)"
            className="w-32 bg-surface-800 text-gray-200 text-sm rounded px-2 py-1 border border-surface-600"
          />
          <textarea
            value={JSON.stringify(editing.config || {}, null, 2)}
            onChange={(e) => {
              try { setEditing({ ...editing, config: JSON.parse(e.target.value) }); } catch {}
            }}
            rows={4}
            className="w-full bg-surface-800 text-gray-200 text-xs font-mono rounded px-2 py-1 border border-surface-600"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs bg-accent-green text-white px-3 py-1 rounded">Save</button>
            <button onClick={() => setEditing(null)} className="text-xs bg-surface-600 text-gray-300 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {collectors.map((col) => (
          <div key={col.id} className="bg-surface-700 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-gray-400 uppercase">{col.type}</span>
                <span className="text-sm text-gray-200">{col.name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Every {col.interval_seconds}s</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(col)}
                className={`text-xs px-2 py-1 rounded ${col.enabled ? 'bg-accent-green/20 text-accent-green' : 'bg-surface-600 text-gray-500'}`}
              >
                {col.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button onClick={() => setEditing(col)} className="text-xs text-accent-blue hover:underline">Edit</button>
              <button onClick={() => handleDelete(col.id)} className="text-xs text-accent-red hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
