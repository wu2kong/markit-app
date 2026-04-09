import type { FolderWithChildren } from '../../types';
import { FiChevronRight, FiChevronDown, FiFolder } from 'react-icons/fi';
import { useState } from 'react';
import { ContextMenu, RenameModal, DeleteConfirmModal } from '../common/ContextMenu';

interface FolderTreeProps {
  folders: FolderWithChildren[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  depth?: number;
}

export function FolderTree({ folders, selectedId, onSelect, onRename, onDelete, depth = 0 }: FolderTreeProps) {
  if (folders.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        暂无文件夹
      </div>
    );
  }

  return (
    <div className="py-1">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          selectedId={selectedId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          depth={depth}
        />
      ))}
    </div>
  );
}

function FolderItem({
  folder,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  depth
}: {
  folder: FolderWithChildren;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2.5 mx-1 rounded-md cursor-pointer text-xs group"
        style={{
          marginLeft: depth * 16,
          background: isSelected ? 'var(--color-accent-light)' : 'transparent',
          color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        onContextMenu={handleContextMenu}
        onMouseEnter={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }
        }}
      >
        {hasChildren ? (
          expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
        ) : (
          <span style={{ width: 14 }} />
        )}
        <FiFolder size={14} style={{ color: 'var(--color-accent)' }} />
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {folder.bookmark_count}
        </span>
      </div>
      {expanded && hasChildren && (
        <FolderTree
          folders={folder.children}
          selectedId={selectedId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          depth={depth + 1}
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={onRename ? () => setShowRenameModal(true) : undefined}
          onDelete={onDelete ? () => setShowDeleteModal(true) : undefined}
        />
      )}
      {showRenameModal && onRename && (
        <RenameModal
          initialName={folder.name}
          onConfirm={(name) => {
            onRename(folder.id, name);
            setShowRenameModal(false);
          }}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
      {showDeleteModal && onDelete && (
        <DeleteConfirmModal
          itemName={folder.name}
          onConfirm={() => {
            onDelete(folder.id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}