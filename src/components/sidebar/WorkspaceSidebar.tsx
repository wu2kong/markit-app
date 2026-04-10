import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { FiPlus, FiSun, FiMoon, FiSettings, FiEdit2, FiTrash2, FiDroplet } from 'react-icons/fi';
import { useState, useCallback, useRef, type DragEvent, useEffect } from 'react';
import { RenameModal, DeleteConfirmModal } from '../common/ContextMenu';

const WORKSPACE_COLORS = [
  '#818cf8', '#a78bfa', '#f472b6', '#fb7185',
  '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
  '#22d3ee', '#60a5fa', '#c084fc', '#e879f9',
];

function getInitials(name: string) {
  return name.slice(0, 2);
}

function getWorkspaceIcon(workspace: { name: string; icon: string | null }) {
  if (workspace.icon) return workspace.icon;
  return null;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  workspaceId: string | null;
  workspaceName: string;
}

interface ColorPickerState {
  visible: boolean;
  x: number;
  y: number;
  workspaceId: string | null;
}

export function WorkspaceSidebar() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const addWorkspace = useWorkspaceStore((s) => s.addWorkspace);
  const removeWorkspace = useWorkspaceStore((s) => s.removeWorkspace);
  const renameWorkspace = useWorkspaceStore((s) => s.renameWorkspace);
  const updateWorkspaceColor = useWorkspaceStore((s) => s.updateWorkspaceColor);
  const reorderWorkspaces = useWorkspaceStore((s) => s.reorderWorkspaces);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [newName, setNewName] = useState('');
  const [workspacesLocal, setWorkspacesLocal] = useState(workspaces);

  useEffect(() => {
    setWorkspacesLocal(workspaces);
  }, [workspaces]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    workspaceId: null,
    workspaceName: '',
  });

  const [colorPicker, setColorPicker] = useState<ColorPickerState>({
    visible: false,
    x: 0,
    y: 0,
    workspaceId: null,
  });

  const [renameModal, setRenameModal] = useState<{ visible: boolean; workspaceId: string | null; name: string }>({
    visible: false,
    workspaceId: null,
    name: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; workspaceId: string | null; name: string }>({
    visible: false,
    workspaceId: null,
    name: '',
  });

  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, workspaceId: string, name: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      workspaceId,
      workspaceName: name,
    });
  }, []);

  const handleColorPickerOpen = useCallback((e: React.MouseEvent, workspaceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setColorPicker({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      workspaceId,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleColorSelect = useCallback(async (color: string) => {
    if (colorPicker.workspaceId) {
      await updateWorkspaceColor(colorPicker.workspaceId, color);
    }
    setColorPicker((prev) => ({ ...prev, visible: false }));
  }, [colorPicker.workspaceId, updateWorkspaceColor]);

  const handleRename = useCallback(() => {
    setRenameModal({
      visible: true,
      workspaceId: contextMenu.workspaceId,
      name: contextMenu.workspaceName,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [contextMenu.workspaceId, contextMenu.workspaceName]);

  const handleRenameConfirm = useCallback(async (name: string) => {
    if (renameModal.workspaceId) {
      await renameWorkspace(renameModal.workspaceId, name);
    }
    setRenameModal({ visible: false, workspaceId: null, name: '' });
  }, [renameModal.workspaceId, renameWorkspace]);

  const handleDelete = useCallback(() => {
    setDeleteConfirm({
      visible: true,
      workspaceId: contextMenu.workspaceId,
      name: contextMenu.workspaceName,
    });
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [contextMenu.workspaceId, contextMenu.workspaceName]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirm.workspaceId) {
      await removeWorkspace(deleteConfirm.workspaceId);
    }
    setDeleteConfirm({ visible: false, workspaceId: null, name: '' });
  }, [deleteConfirm.workspaceId, removeWorkspace]);

  const handleAddWorkspace = useCallback(async () => {
    if (newName.trim()) {
      await addWorkspace(newName.trim());
      setNewName('');
      setShowNewWorkspace(false);
    }
  }, [newName, addWorkspace]);

  const handleDragStart = useCallback((e: DragEvent, workspaceId: string) => {
    dragItem.current = workspaceId;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: DragEvent, workspaceId: string) => {
    e.preventDefault();
    dragOverItem.current = workspaceId;
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    const dragId = dragItem.current;
    const overId = dragOverItem.current;
    
    if (!dragId || !overId || dragId === overId) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const dragIndex = workspaces.findIndex((w) => w.id === dragId);
    const overIndex = workspaces.findIndex((w) => w.id === overId);

    if (dragIndex === -1 || overIndex === -1) return;

    const newWorkspaces = [...workspaces];
    const [draggedItem] = newWorkspaces.splice(dragIndex, 1);
    newWorkspaces.splice(overIndex, 0, draggedItem);

    dragItem.current = null;
    dragOverItem.current = null;

    setWorkspacesLocal(newWorkspaces);
    await reorderWorkspaces(newWorkspaces.map((w) => w.id));
  }, [workspaces, reorderWorkspaces]);

  const handleDragEnd = useCallback(() => {
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  return (
    <>
      <div
        className="flex flex-col items-center h-full border-r"
        style={{
          width: '72px',
          minWidth: '72px',
          background: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="flex flex-col items-center gap-1.5 pt-3 px-2 flex-1 overflow-y-auto w-full"
          style={{ scrollbarWidth: 'none' }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {workspacesLocal.map((w) => {
            const isActive = w.id === currentWorkspaceId;
            const color = w.color || WORKSPACE_COLORS[workspacesLocal.indexOf(w) % WORKSPACE_COLORS.length];
            const customIcon = getWorkspaceIcon(w);
            const isDragging = dragItem.current === w.id;
            return (
              <button
                key={w.id}
                className="workspace-item"
                draggable
                onDragStart={(e) => handleDragStart(e, w.id)}
                onDragEnter={(e) => handleDragEnter(e, w.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setCurrentWorkspace(w.id)}
                onContextMenu={(e) => handleContextMenu(e, w.id, w.name)}
                title={w.name}
                style={{
                  background: isActive ? 'var(--color-accent-light)' : 'transparent',
                  borderColor: isActive ? 'var(--color-accent)' : 'transparent',
                  opacity: isDragging ? 0.5 : 1,
                }}
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

      {contextMenu.visible && (
        <div
          className="fixed py-1 rounded-md shadow-lg border"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
            zIndex: 1000,
            minWidth: 140,
          }}
          onMouseLeave={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        >
          <button
            className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)]"
            onClick={handleRename}
          >
            <FiEdit2 size={12} />
            重命名
          </button>
          <button
            className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)]"
            onClick={(e) => handleColorPickerOpen(e, contextMenu.workspaceId!)}
          >
            <FiDroplet size={12} />
            更换颜色
          </button>
          <button
            className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)] text-red-500"
            onClick={handleDelete}
          >
            <FiTrash2 size={12} />
            删除
          </button>
        </div>
      )}

      {colorPicker.visible && (
        <div
          className="fixed py-2 px-2 rounded-md shadow-lg border"
          style={{
            left: colorPicker.x,
            top: colorPicker.y,
            background: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
            zIndex: 1001,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
          }}
          onMouseLeave={() => setColorPicker((prev) => ({ ...prev, visible: false }))}
        >
          {WORKSPACE_COLORS.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
              style={{ background: color }}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      )}

      {renameModal.visible && (
        <RenameModal
          initialName={renameModal.name}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenameModal({ visible: false, workspaceId: null, name: '' })}
        />
      )}

      {deleteConfirm.visible && (
        <DeleteConfirmModal
          itemName={deleteConfirm.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm({ visible: false, workspaceId: null, name: '' })}
        />
      )}
    </>
  );
}