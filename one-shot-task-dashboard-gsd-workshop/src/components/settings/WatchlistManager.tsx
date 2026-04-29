import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Watchlist } from '../../lib/types';

export function WatchlistManager() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [editing, setEditing] = useState<Partial<Watchlist> | null>(null);

  useEffect(() => {
    api.getWatchlists().then(setWatchlists).catch(() => {});
  }, []);

  const refresh = () => api.getWatchlists().then(setWatchlists);

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) {
      await api.updateWatchlist(editing.id, editing);
    } else {
      await api.createWatchlist(editing);
    }
    setEditing(null);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await api.deleteWatchlist(id);
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Watchlists</h3>
        <button
          onClick={() => setEditing({ name: '', keywords: [], sources: ['all'], severity_override: null })}
          className="text-xs bg-accent-blue text-white px-3 py-1 rounded hover:bg-accent-blue/80"
        >
          + Add
        </button>
      </div>

      {editing && (
        <div className="bg-surface-700 rounded-lg p-3 mb-3 space-y-2">
          <input
            type="text"
            value={editing.name || ''}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder="Watchlist name"
            className="w-full bg-surface-800 text-gray-200 text-sm rounded px-2 py-1 border border-surface-600"
          />
          <input
            type="text"
            value={(editing.keywords || []).join(', ')}
            onChange={(e) => setEditing({ ...editing, keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder="Keywords (comma-separated)"
            className="w-full bg-surface-800 text-gray-200 text-sm rounded px-2 py-1 border border-surface-600"
          />
          <select
            value={editing.severity_override || ''}
            onChange={(e) => setEditing({ ...editing, severity_override: e.target.value || null })}
            className="bg-surface-800 text-gray-300 text-sm rounded px-2 py-1 border border-surface-600"
          >
            <option value="">No severity override</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} className="text-xs bg-accent-green text-white px-3 py-1 rounded">Save</button>
            <button onClick={() => setEditing(null)} className="text-xs bg-surface-600 text-gray-300 px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {watchlists.map((wl) => (
          <div key={wl.id} className="bg-surface-700 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-200">{wl.name}</div>
              <div className="text-xs text-gray-500">{wl.keywords.join(', ')}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(wl)} className="text-xs text-accent-blue hover:underline">Edit</button>
              <button onClick={() => handleDelete(wl.id)} className="text-xs text-accent-red hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
