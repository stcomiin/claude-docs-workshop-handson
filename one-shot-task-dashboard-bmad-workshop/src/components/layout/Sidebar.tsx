import { useDashboardStore } from '../../stores/dashboard';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: '◉' },
  { id: 'timeline' as const, label: 'Timeline', icon: '☰' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const { activeView, setView } = useDashboardStore();

  return (
    <aside className="w-16 bg-surface-800 border-r border-surface-600 flex flex-col items-center py-4 gap-2">
      <div className="text-accent-green font-bold text-lg mb-4">OS</div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors ${
            activeView === item.id
              ? 'bg-accent-blue/20 text-accent-blue'
              : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
          }`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
