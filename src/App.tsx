import { useEffect } from 'react';
import { useThemeStore } from './stores/useThemeStore';
import { useWorkspaceStore } from './stores/useWorkspaceStore';
import { useDataStore } from './stores/useDataStore';
import { AppHeader } from './components/layout/AppHeader';
import { WorkspaceSidebar } from './components/sidebar/WorkspaceSidebar';
import { Sidebar } from './components/sidebar/Sidebar';
import { BookmarkPanel } from './components/bookmarks/BookmarkPanel';
import { DetailPanel } from './components/detail/DetailPanel';
import { Toast } from './components/common/Toast';

function App() {
  const themeMode = useThemeStore((s) => s.mode);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const loadWorkspaces = useWorkspaceStore((s) => s.load);
  const loadData = useDataStore((s) => s.loadAll);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (currentWorkspaceId) {
      loadData(currentWorkspaceId);
    }
  }, [currentWorkspaceId, loadData]);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar />
        <Sidebar />
        <BookmarkPanel />
        <DetailPanel />
      </div>
      <Toast />
    </div>
  );
}

export default App;
