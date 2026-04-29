import { WatchlistManager } from './WatchlistManager';
import { CollectorManager } from './CollectorManager';

export function SettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-semibold text-gray-200">Settings</h2>
      <WatchlistManager />
      <hr className="border-surface-600" />
      <CollectorManager />
    </div>
  );
}
