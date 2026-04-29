import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { TimelineView } from './components/timeline/TimelineView';
import { SettingsView } from './components/settings/SettingsView';
import { useDashboardStore } from './stores/dashboard';
import { useWebSocket } from './hooks/useWebSocket';
import { useItems } from './hooks/useItems';
import { useStats } from './hooks/useStats';

const VIEWS = {
  dashboard: DashboardView,
  timeline: TimelineView,
  settings: SettingsView,
};

export function App() {
  useWebSocket();
  useItems();
  useStats();
  const { activeView } = useDashboardStore();
  const View = VIEWS[activeView];

  return (
    <Layout>
      <View />
    </Layout>
  );
}
