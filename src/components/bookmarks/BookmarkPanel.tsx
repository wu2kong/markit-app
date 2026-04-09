import type { DisplayMode, BookmarkWithDetails } from '../../types';
import { useViewStore } from '../../stores/useViewStore';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkListItem } from './BookmarkListItem';
import { BookmarkCompactItem } from './BookmarkCompactItem';
import { BookmarkContextMenu } from './BookmarkContextMenu';
import { AddBookmarkInput } from './AddBookmarkInput';
import { ResizeHandle } from '../common/ResizeHandle';
import { FiList, FiGrid, FiMinimize2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useEffect, useCallback, useState } from 'react';

const displayModes: { mode: DisplayMode; icon: typeof FiList; label: string }[] = [
  { mode: 'list', icon: FiList, label: 'List' },
  { mode: 'card', icon: FiGrid, label: 'Card' },
  { mode: 'compact', icon: FiMinimize2, label: 'Compact' },
];

interface ContextMenuState {
  x: number;
  y: number;
  bookmark: BookmarkWithDetails;
}

export function BookmarkPanel() {
  const displayMode = useViewStore((s) => s.displayMode);
  const setDisplayMode = useViewStore((s) => s.setDisplayMode);
  const viewMode = useViewStore((s) => s.viewMode);
  const selection = useViewStore((s) => s.selection);
  const globalSearch = useViewStore((s) => s.globalSearch);
  const bookmarkPanelWidth = useViewStore((s) => s.bookmarkPanelWidth);
  const bookmarkPanelCollapsed = useViewStore((s) => s.bookmarkPanelCollapsed);
  const setBookmarkPanelWidth = useViewStore((s) => s.setBookmarkPanelWidth);
  const setBookmarkPanelCollapsed = useViewStore((s) => s.setBookmarkPanelCollapsed);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const selectedBookmark = useBookmarkStore((s) => s.selectedBookmark);
  const selectBookmark = useBookmarkStore((s) => s.selectBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const loading = useBookmarkStore((s) => s.loading);
  const loadAllBookmarks = useBookmarkStore((s) => s.loadAll);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const search = useBookmarkStore((s) => s.search);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    if (globalSearch && currentWorkspaceId) {
      search(currentWorkspaceId, globalSearch);
    }
  }, [globalSearch, currentWorkspaceId, search]);

  useEffect(() => {
    if (!selection.id && currentWorkspaceId && !globalSearch) {
      loadAllBookmarks(currentWorkspaceId);
    }
  }, [selection.id, currentWorkspaceId, globalSearch, loadAllBookmarks]);

  const handleResize = useCallback((delta: number) => {
    const newWidth = Math.max(250, Math.min(600, bookmarkPanelWidth + delta));
    setBookmarkPanelWidth(newWidth);
  }, [bookmarkPanelWidth, setBookmarkPanelWidth]);

  const handleResetWidth = useCallback(() => {
    setBookmarkPanelWidth(400);
  }, [setBookmarkPanelWidth]);

  const handleToggleCollapse = useCallback(() => {
    setBookmarkPanelCollapsed(!bookmarkPanelCollapsed);
  }, [bookmarkPanelCollapsed, setBookmarkPanelCollapsed]);

  const handleContextMenu = useCallback((bookmark: BookmarkWithDetails) => (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, bookmark });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteBookmark = useCallback(async (id: string) => {
    await removeBookmark(id);
  }, [removeBookmark]);

  const headerTitle = globalSearch
    ? `搜索: "${globalSearch}"`
    : selection.id
      ? `${viewMode === 'folders' ? '文件夹' : viewMode === 'collections' ? '合集' : viewMode === 'tags' ? '标签' : '笔记'}书签`
      : '所有书签';

  if (bookmarkPanelCollapsed) {
    return (
      <div
        className="flex flex-col h-full border-r relative"
        style={{
          width: '48px',
          minWidth: '48px',
          background: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          className="btn-icon absolute top-2 left-1/2 -translate-x-1/2"
          onClick={handleToggleCollapse}
          title="展开书签面板"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full border-r relative"
      style={{
        width: `${bookmarkPanelWidth}px`,
        minWidth: '250px',
        maxWidth: '600px',
        background: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <ResizeHandle onResize={handleResize} onDoubleClick={handleResetWidth} direction="right" />

      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
      >
        <div className="flex items-center gap-3.5">
          <h2 className="text-sm font-semibold">
            {headerTitle}
          </h2>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {bookmarks.length} 项
          </span>
        </div>
        <div className="flex items-center gap-1">
          {displayModes.map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              className="btn-icon"
              style={{
                background: displayMode === mode ? 'var(--color-accent-light)' : 'transparent',
                color: displayMode === mode ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              }}
              onClick={() => setDisplayMode(mode)}
              title={mode}
            >
              <Icon size={14} />
            </button>
          ))}
          <button
            className="btn-icon"
            onClick={handleToggleCollapse}
            title="收起书签面板"
          >
            <FiChevronLeft size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            加载中...
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            <p>暂无书签</p>
            <p className="mt-3">在下方添加书签或选择一个{viewMode === 'folders' ? '文件夹' : viewMode === 'collections' ? '合集' : '标签'}</p>
          </div>
        ) : (
          <div className={displayMode === 'card' ? 'grid grid-cols-2 gap-4 p-5' : displayMode === 'compact' ? 'flex flex-col gap-1.5 py-3 px-3' : 'py-3 flex flex-col gap-2'}>
            {bookmarks.map((bookmark) => {
              if (displayMode === 'card') {
                return (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={selectedBookmark?.id === bookmark.id}
                    onSelect={() => selectBookmark(bookmark.id)}
                    onContextMenu={handleContextMenu(bookmark)}
                  />
                );
              } else if (displayMode === 'compact') {
                return (
                  <BookmarkCompactItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={selectedBookmark?.id === bookmark.id}
                    onSelect={() => selectBookmark(bookmark.id)}
                    onContextMenu={handleContextMenu(bookmark)}
                  />
                );
              }
              return (
                <BookmarkListItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  isSelected={selectedBookmark?.id === bookmark.id}
                  onSelect={() => selectBookmark(bookmark.id)}
                  onContextMenu={handleContextMenu(bookmark)}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddBookmarkInput />

      <BookmarkContextMenu
        menuState={contextMenu}
        onClose={handleCloseContextMenu}
        onDelete={handleDeleteBookmark}
      />
    </div>
  );
}