import { useEffect, useRef } from 'react';
import type { BookmarkWithDetails } from '../../types';
import { copyToClipboard, formatMarkdownLink } from '../../utils/helpers';
import { useToastStore } from '../../stores/useToastStore';
import { FiExternalLink, FiCopy, FiTrash2 } from 'react-icons/fi';

interface ContextMenuState {
  x: number;
  y: number;
  bookmark: BookmarkWithDetails;
}

interface BookmarkContextMenuProps {
  menuState: ContextMenuState | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function BookmarkContextMenu({ menuState, onClose, onDelete }: BookmarkContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((s) => s.showToast);

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

  if (!menuState) return null;

  const { x, y, bookmark } = menuState;

  const handleOpenBrowser = () => {
    window.open(bookmark.url, '_blank');
    onClose();
  };

  const handleCopyMarkdownLink = () => {
    copyToClipboard(formatMarkdownLink(bookmark.title, bookmark.url));
    showToast('已复制 Markdown 链接');
    onClose();
  };

  const handleCopyTitleAndLink = () => {
    copyToClipboard(`${bookmark.title}\n${bookmark.url}`);
    showToast('已复制标题和链接');
    onClose();
  };

  const handleCopyLinkOnly = () => {
    copyToClipboard(bookmark.url);
    showToast('已复制链接');
    onClose();
  };

  const handleDelete = () => {
    onDelete(bookmark.id);
    onClose();
  };

  const menuStyle: React.CSSProperties = {
    left: x,
    top: y,
    background: 'var(--color-bg-primary)',
    borderColor: 'var(--color-border)',
    minWidth: 180,
  };

  return (
    <div
      ref={menuRef}
      className="fixed py-1 rounded-md shadow-lg border z-50"
      style={menuStyle}
    >
      <button
        className="w-full px-3 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)]"
        onClick={handleOpenBrowser}
      >
        <FiExternalLink size={14} />
        <span>在浏览器打开</span>
      </button>
      <button
        className="w-full px-3 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)]"
        onClick={handleCopyMarkdownLink}
      >
        <span className="text-xs font-bold w-3.5">MD</span>
        <span>复制 Markdown 链接</span>
      </button>
      <button
        className="w-full px-3 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)]"
        onClick={handleCopyTitleAndLink}
      >
        <FiCopy size={14} />
        <span>复制标题 + 链接</span>
      </button>
      <button
        className="w-full px-3 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)]"
        onClick={handleCopyLinkOnly}
      >
        <FiCopy size={14} />
        <span>仅复制链接</span>
      </button>
      <div className="h-px my-1" style={{ background: 'var(--color-border)' }} />
      <button
        className="w-full px-3 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[var(--color-bg-secondary)] text-red-500"
        onClick={handleDelete}
      >
        <FiTrash2 size={14} />
        <span>删除书签</span>
      </button>
    </div>
  );
}