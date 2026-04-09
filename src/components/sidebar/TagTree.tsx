import type { TagWithChildren } from '../../types';
import { FiChevronRight, FiChevronDown, FiTag } from 'react-icons/fi';
import { useState } from 'react';
import { ContextMenu, RenameModal, DeleteConfirmModal } from '../common/ContextMenu';

interface TagTreeProps {
  tags: TagWithChildren[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  depth?: number;
}

export function TagTree({ tags, selectedId, onSelect, onRename, onDelete, depth = 0 }: TagTreeProps) {
  if (tags.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        暂无标签
      </div>
    );
  }

  return (
    <div className="py-1">
      {tags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
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

function TagItem({
  tag,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  depth
}: {
  tag: TagWithChildren;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = tag.children && tag.children.length > 0;
  const isSelected = selectedId === tag.id;
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
          onSelect(tag.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        onContextMenu={handleContextMenu}
      >
        {hasChildren ? (
          expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
        ) : (
          <span style={{ width: 14 }} />
        )}
        <FiTag size={14} style={{ color: tag.color || 'var(--color-accent)' }} />
        <span className="flex-1 truncate">{tag.name}</span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {tag.bookmark_count}
        </span>
      </div>
      {expanded && hasChildren && (
        <TagTree
          tags={tag.children}
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
          initialName={tag.name}
          onConfirm={(name) => {
            onRename(tag.id, name);
            setShowRenameModal(false);
          }}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
      {showDeleteModal && onDelete && (
        <DeleteConfirmModal
          itemName={tag.name}
          onConfirm={() => {
            onDelete(tag.id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}