import { useThemeStore } from '../../stores/useThemeStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useViewStore } from '../../stores/useViewStore';
import { FiSun, FiMoon, FiPlus, FiSearch } from 'react-icons/fi';
import { useState, useCallback } from 'react';

export function AppHeader() {
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const globalSearch = useViewStore((s) => s.globalSearch);
  const setGlobalSearch = useViewStore((s) => s.setGlobalSearch);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAddWorkspace = useCallback(async () => {
    if (newName.trim()) {
      await addWorkspace(newName.trim());
      setNewName('');
      setShowNewWorkspace(false);
    }
  }, [newName, addWorkspace]);

  return (
    <div
      className="flex items-center justify-between px-4 h-14 border-b drag-region"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-5 no-drag">
        <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--color-accent)' }}>
          MarkIt
        </span>
        <select
          value={currentWorkspaceId || ''}
          onChange={(e) => setCurrentWorkspace(e.target.value)}
          className="input text-xs"
          style={{ width: 'auto', background: 'var(--color-bg-primary)' }}
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        {showNewWorkspace ? (
          <div className="flex items-center gap-2">
            <input
              className="input text-xs"
              style={{ width: 140 }}
              placeholder="工作空间名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWorkspace()}
              autoFocus
            />
            <button className="btn btn-primary text-xs" onClick={handleAddWorkspace}>
              添加
            </button>
            <button className="btn btn-ghost text-xs" onClick={() => setShowNewWorkspace(false)}>
              取消
            </button>
          </div>
        ) : (
          <button className="btn-icon" onClick={() => setShowNewWorkspace(true)} title="新建工作空间">
            <FiPlus size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 max-w-md mx-8 no-drag">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="搜索书签、合集、标签..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn-icon no-drag"
        onClick={toggleTheme}
        title={`切换到${themeMode === 'light' ? '深色' : '浅色'}模式`}
      >
        {themeMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
      </button>
    </div>
  );
}