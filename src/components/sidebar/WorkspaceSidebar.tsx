import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { FiPlus, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { useState, useCallback } from 'react';

const WORKSPACE_COLORS = [
  '#818cf8', '#a78bfa', '#f472b6', '#fb7185',
  '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
  '#22d3ee', '#60a5fa', '#c084fc', '#e879f9',
];

function getWorkspaceColor(index: number) {
  return WORKSPACE_COLORS[index % WORKSPACE_COLORS.length];
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

function getWorkspaceIcon(workspace: { name: string; icon: string | null }, index: number) {
  if (workspace.icon) return workspace.icon;
  return null;
}

export function WorkspaceSidebar() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
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
      className="flex flex-col items-center h-full border-r"
      style={{
        width: '72px',
        minWidth: '72px',
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex flex-col items-center gap-1.5 pt-3 px-2 flex-1 overflow-y-auto w-full"
        style={{ scrollbarWidth: 'none' }}
      >
        {workspaces.map((w, index) => {
          const isActive = w.id === currentWorkspaceId;
          const color = getWorkspaceColor(index);
          const customIcon = getWorkspaceIcon(w, index);
          return (
            <button
              key={w.id}
              className="workspace-item"
              style={{
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                borderColor: isActive ? 'var(--color-accent)' : 'transparent',
              }}
              onClick={() => setCurrentWorkspace(w.id)}
              title={w.name}
            >
              {customIcon ? (
                <span className="workspace-item-icon" style={{ fontSize: '20px' }}>{customIcon}</span>
              ) : (
                <span
                  className="workspace-item-icon"
                  style={{
                    background: isActive ? 'var(--color-accent)' : color,
                    color: '#fff',
                  }}
                >
                  {getInitials(w.name)}
                </span>
              )}
              <span
                className="workspace-item-label"
                style={{
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
              >
              </span>
            </button>
          );
        })}

        {showNewWorkspace ? (
          <div className="flex flex-col items-center gap-1 w-full">
            <input
              className="input text-center"
              style={{ width: '56px', fontSize: '11px', padding: '4px 2px' }}
              placeholder="名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWorkspace();
                if (e.key === 'Escape') { setShowNewWorkspace(false); setNewName(''); }
              }}
              autoFocus
            />
            <button
              className="text-xs"
              style={{ color: 'var(--color-accent)' }}
              onClick={handleAddWorkspace}
            >
              确定
            </button>
            <button
              className="text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
              onClick={() => { setShowNewWorkspace(false); setNewName(''); }}
            >
              取消
            </button>
          </div>
        ) : (
          <button
            className="workspace-item"
            style={{ background: 'transparent', borderColor: 'transparent' }}
            onClick={() => setShowNewWorkspace(true)}
            title="新建工作空间"
          >
            <span
              className="workspace-item-icon workspace-add-icon"
              style={{
                border: `1.5px dashed var(--color-text-tertiary)`,
                color: 'var(--color-text-tertiary)',
              }}
            >
              <FiPlus size={16} />
            </span>
            <span
              className="workspace-item-label"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
            </span>
          </button>
        )}
      </div>

      <div
        className="flex flex-col items-center gap-1 py-3 w-full"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`切换到${themeMode === 'light' ? '深色' : '浅色'}模式`}
          style={{ width: '36px', height: '36px' }}
        >
          {themeMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
        </button>
        <button
          className="btn-icon"
          title="设置"
          style={{ width: '36px', height: '36px' }}
        >
          <FiSettings size={16} />
        </button>
      </div>
    </div>
  );
}