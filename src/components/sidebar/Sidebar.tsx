import { useViewStore } from '../../stores/useViewStore';
import { useDataStore } from '../../stores/useDataStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import type { ViewMode } from '../../types';
import { FiFolder, FiLayers, FiTag, FiFileText, FiSearch, FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FolderTree } from './FolderTree';
import { CollectionList } from './CollectionList';
import { TagTree } from './TagTree';
import { NotesList } from './NotesList';
import { ResizeHandle } from '../common/ResizeHandle';
import { useState, useCallback } from 'react';

const viewTabs: { mode: ViewMode; icon: typeof FiFolder; label: string }[] = [
  { mode: 'folders', icon: FiFolder, label: '文件夹' },
  { mode: 'collections', icon: FiLayers, label: '合集' },
  { mode: 'tags', icon: FiTag, label: '标签' },
  { mode: 'notes', icon: FiFileText, label: '笔记' },
];

export function Sidebar() {
  const viewMode = useViewStore((s) => s.viewMode);
  const setViewMode = useViewStore((s) => s.setViewMode);
  const sidebarSearch = useViewStore((s) => s.sidebarSearch);
  const setSidebarSearch = useViewStore((s) => s.setSidebarSearch);
  const selection = useViewStore((s) => s.selection);
  const setSelection = useViewStore((s) => s.setSelection);
  const sidebarWidth = useViewStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useViewStore((s) => s.sidebarCollapsed);
  const setSidebarWidth = useViewStore((s) => s.setSidebarWidth);
  const setSidebarCollapsed = useViewStore((s) => s.setSidebarCollapsed);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const addFolder = useDataStore((s) => s.addFolder);
  const addCollection = useDataStore((s) => s.addCollection);
  const addTag = useDataStore((s) => s.addTag);
  const updateFolder = useDataStore((s) => s.updateFolder);
  const updateCollection = useDataStore((s) => s.updateCollection);
  const updateTag = useDataStore((s) => s.updateTag);
  const removeFolder = useDataStore((s) => s.removeFolder);
  const removeCollection = useDataStore((s) => s.removeCollection);
  const removeTag = useDataStore((s) => s.removeTag);
  const { folderTree, collections, tagTree } = useDataStore();
  const loadByFolder = useBookmarkStore((s) => s.loadByFolder);
  const loadByCollection = useBookmarkStore((s) => s.loadByCollection);
  const loadByTag = useBookmarkStore((s) => s.loadByTag);
  const loadAllBookmarks = useBookmarkStore((s) => s.loadAll);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addName, setAddName] = useState('');

  const handleSelect = useCallback(
    (type: ViewMode, id: string | null) => {
      setSelection({ type, id });
      if (id === null) {
        if (currentWorkspaceId) {
          loadAllBookmarks(currentWorkspaceId);
        }
      } else {
        if (type === 'folders') loadByFolder(id);
        else if (type === 'collections') loadByCollection(id);
        else if (type === 'tags') loadByTag(id);
      }
    },
    [setSelection, loadByFolder, loadByCollection, loadByTag, loadAllBookmarks, currentWorkspaceId]
  );

  const handleAdd = useCallback(async () => {
    if (!addName.trim() || !currentWorkspaceId) return;
    if (viewMode === 'folders') {
      await addFolder(currentWorkspaceId, addName.trim(), selection.type === 'folders' && selection.id ? selection.id : undefined);
    } else if (viewMode === 'collections') {
      await addCollection(currentWorkspaceId, addName.trim());
    } else if (viewMode === 'tags') {
      await addTag(currentWorkspaceId, addName.trim());
    }
    setAddName('');
    setShowAddInput(false);
  }, [addName, currentWorkspaceId, viewMode, selection, addFolder, addCollection, addTag]);

  const handleResize = useCallback((delta: number) => {
    const newWidth = Math.max(180, Math.min(400, sidebarWidth + delta));
    setSidebarWidth(newWidth);
  }, [sidebarWidth, setSidebarWidth]);

  const handleResetWidth = useCallback(() => {
    setSidebarWidth(280);
  }, [setSidebarWidth]);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const handleRenameFolder = useCallback(async (id: string, name: string) => {
    if (currentWorkspaceId) {
      await updateFolder(id, name, currentWorkspaceId);
    }
  }, [currentWorkspaceId, updateFolder]);

  const handleRenameCollection = useCallback(async (id: string, name: string) => {
    if (currentWorkspaceId) {
      await updateCollection(id, name, currentWorkspaceId);
    }
  }, [currentWorkspaceId, updateCollection]);

  const handleRenameTag = useCallback(async (id: string, name: string) => {
    if (currentWorkspaceId) {
      await updateTag(id, name, currentWorkspaceId);
    }
  }, [currentWorkspaceId, updateTag]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    if (currentWorkspaceId) {
      await removeFolder(id, currentWorkspaceId);
      if (selection.type === 'folders' && selection.id === id) {
        setSelection({ type: 'folders', id: null });
      }
    }
  }, [currentWorkspaceId, removeFolder, selection, setSelection]);

  const handleDeleteCollection = useCallback(async (id: string) => {
    if (currentWorkspaceId) {
      await removeCollection(id, currentWorkspaceId);
      if (selection.type === 'collections' && selection.id === id) {
        setSelection({ type: 'collections', id: null });
      }
    }
  }, [currentWorkspaceId, removeCollection, selection, setSelection]);

  const handleDeleteTag = useCallback(async (id: string) => {
    if (currentWorkspaceId) {
      await removeTag(id, currentWorkspaceId);
      if (selection.type === 'tags' && selection.id === id) {
        setSelection({ type: 'tags', id: null });
      }
    }
  }, [currentWorkspaceId, removeTag, selection, setSelection]);

  const filteredFolderTree = sidebarSearch
    ? filterFolderTree(folderTree, sidebarSearch.toLowerCase())
    : folderTree;

  const filteredCollections = sidebarSearch
    ? collections.filter((c) => c.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : collections;

  const filteredTagTree = sidebarSearch
    ? filterTagTree(tagTree, sidebarSearch.toLowerCase())
    : tagTree;

  if (sidebarCollapsed) {
    return (
      <div
        className="flex flex-col h-full border-r relative"
        style={{
          width: '48px',
          minWidth: '48px',
          background: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          className="btn-icon absolute top-2 left-1/2 -translate-x-1/2"
          onClick={handleToggleCollapse}
          title="展开侧边栏"
        >
          <FiChevronRight size={16} />
        </button>
        <div className="flex flex-col items-center gap-2 pt-12 px-2">
          {viewTabs.map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              className="btn-icon"
              style={{
                background: viewMode === mode ? 'var(--color-accent-light)' : 'transparent',
                color: viewMode === mode ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
              }}
              onClick={() => setViewMode(mode)}
              title={mode}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full border-r relative"
      style={{
        width: `${sidebarWidth}px`,
        minWidth: '180px',
        maxWidth: '400px',
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <ResizeHandle onResize={handleResize} onDoubleClick={handleResetWidth} direction="right" />

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1">
          {viewTabs.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              className="btn-icon"
              style={{
                background: viewMode === mode ? 'var(--color-accent-light)' : 'transparent',
                color: viewMode === mode ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              }}
              onClick={() => setViewMode(mode)}
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <button
          className="btn-icon"
          onClick={handleToggleCollapse}
          title="收起侧边栏"
        >
          <FiChevronLeft size={16} />
        </button>
      </div>

      <div className="relative px-4 pb-3">
        <FiSearch size={14} className="absolute left-7 top-2.5" style={{ color: 'var(--color-text-tertiary)' }} />
        <input
          className="input text-xs"
          style={{ paddingLeft: 28 }}
          placeholder={`搜索${viewMode === 'folders' ? '文件夹' : viewMode === 'collections' ? '合集' : viewMode === 'tags' ? '标签' : '笔记'}...`}
          value={sidebarSearch}
          onChange={(e) => setSidebarSearch(e.target.value)}
        />
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 py-1.5"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleSelect(viewMode, null);
          }
        }}
      >
        {viewMode === 'folders' && (
          <FolderTree
            folders={filteredFolderTree}
            selectedId={selection.type === 'folders' ? selection.id : null}
            onSelect={(id) => handleSelect('folders', id)}
            onRename={handleRenameFolder}
            onDelete={handleDeleteFolder}
          />
        )}
        {viewMode === 'collections' && (
          <CollectionList
            collections={filteredCollections}
            selectedId={selection.type === 'collections' ? selection.id : null}
            onSelect={(id) => handleSelect('collections', id)}
            onRename={handleRenameCollection}
            onDelete={handleDeleteCollection}
          />
        )}
        {viewMode === 'tags' && (
          <TagTree
            tags={filteredTagTree}
            selectedId={selection.type === 'tags' ? selection.id : null}
            onSelect={(id) => handleSelect('tags', id)}
            onRename={handleRenameTag}
            onDelete={handleDeleteTag}
          />
        )}
        {viewMode === 'notes' && (
          <NotesList searchQuery={sidebarSearch} onSelect={handleSelect} />
        )}
      </div>

      {(viewMode !== 'notes' && currentWorkspaceId) && (
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {showAddInput ? (
            <div className="flex gap-2">
              <input
                className="input text-xs flex-1"
                placeholder={`新${viewMode === 'folders' ? '文件夹' : viewMode === 'collections' ? '合集' : '标签'}名称`}
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') { setShowAddInput(false); setAddName(''); }
                }}
                autoFocus
              />
              <button className="btn btn-primary text-xs" onClick={handleAdd}>
                添加
              </button>
              <button className="btn text-xs" onClick={() => { setShowAddInput(false); setAddName(''); }}>
                取消
              </button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs"
              style={{ color: 'var(--color-text-tertiary)', background: 'transparent' }}
              onClick={() => setShowAddInput(true)}
            >
              <FiPlus size={14} />
              新建{viewMode === 'folders' ? '文件夹' : viewMode === 'collections' ? '合集' : '标签'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function filterFolderTree(trees: import('../../types').FolderWithChildren[], query: string): import('../../types').FolderWithChildren[] {
  return trees
    .map((tree) => {
      const filteredChildren = filterFolderTree(tree.children, query);
      if (tree.name.toLowerCase().includes(query) || filteredChildren.length > 0) {
        return { ...tree, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean) as import('../../types').FolderWithChildren[];
}

function filterTagTree(trees: import('../../types').TagWithChildren[], query: string): import('../../types').TagWithChildren[] {
  return trees
    .map((tree) => {
      const filteredChildren = filterTagTree(tree.children, query);
      if (tree.name.toLowerCase().includes(query) || filteredChildren.length > 0) {
        return { ...tree, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean) as import('../../types').TagWithChildren[];
}