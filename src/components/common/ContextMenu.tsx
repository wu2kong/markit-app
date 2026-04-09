import { useEffect, useRef, useState } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function ContextMenu({ x, y, onClose, onRename, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed py-1 rounded-md shadow-lg border"
      style={{
        left: x,
        top: y,
        background: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
        zIndex: 1000,
        minWidth: 120,
      }}
    >
      {onRename && (
        <button
          className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)]"
          onClick={() => {
            onRename();
            onClose();
          }}
        >
          重命名
        </button>
      )}
      {onDelete && (
        <button
          className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)] text-red-500"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          删除
        </button>
      )}
    </div>
  );
}

interface RenameModalProps {
  initialName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function RenameModal({ initialName, onConfirm, onCancel }: RenameModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="p-4 rounded-lg border"
        style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', minWidth: 280 }}
      >
        <h3 className="text-sm font-medium mb-3">重命名</h3>
        <input
          ref={inputRef}
          className="input text-xs w-full mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              onConfirm(name.trim());
            }
            if (e.key === 'Escape') {
              onCancel();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            className="btn text-xs"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="btn btn-primary text-xs"
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="p-4 rounded-lg border"
        style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)', minWidth: 280 }}
      >
        <h3 className="text-sm font-medium mb-3">删除 "{itemName}"？</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          此操作无法撤销。
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="btn text-xs"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="btn text-xs"
            style={{ background: '#ef4444', color: 'white' }}
            onClick={onConfirm}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}