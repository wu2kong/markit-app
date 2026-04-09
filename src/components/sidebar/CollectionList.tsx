import type { Collection } from '../../types';
import { FiLayers } from 'react-icons/fi';
import { useState } from 'react';
import { ContextMenu, RenameModal, DeleteConfirmModal } from '../common/ContextMenu';

interface CollectionListProps {
  collections: Collection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}

export function CollectionList({ collections, selectedId, onSelect, onRename, onDelete }: CollectionListProps) {
  if (collections.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        暂无合集
      </div>
    );
  }

  return (
    <div className="py-1">
      {collections.map((collection) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          selectedId={selectedId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CollectionItem({
  collection,
  selectedId,
  onSelect,
  onRename,
  onDelete,
}: {
  collection: Collection;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}) {
  const isSelected = selectedId === collection.id;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2.5 mx-1 rounded-md cursor-pointer text-xs group"
        style={{
          background: isSelected ? 'var(--color-accent-light)' : 'transparent',
          color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)',
        }}
        onClick={() => onSelect(collection.id)}
        onContextMenu={handleContextMenu}
      >
        <FiLayers size={14} style={{ color: 'var(--color-accent)' }} />
        <span className="flex-1 truncate">{collection.name}</span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          {collection.bookmark_count}
        </span>
      </div>
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
          initialName={collection.name}
          onConfirm={(name) => {
            onRename(collection.id, name);
            setShowRenameModal(false);
          }}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
      {showDeleteModal && onDelete && (
        <DeleteConfirmModal
          itemName={collection.name}
          onConfirm={() => {
            onDelete(collection.id);
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}