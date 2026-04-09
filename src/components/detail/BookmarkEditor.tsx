import { useState, useCallback, useEffect } from 'react';
import type { BookmarkWithDetails } from '../../types';
import { useDataStore } from '../../stores/useDataStore';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useToastStore } from '../../stores/useToastStore';
import { copyToClipboard, formatMarkdownLink, openUrl, confirmDialog } from '../../utils/helpers';
import { FiExternalLink, FiCopy, FiSave, FiTrash2, FiX } from 'react-icons/fi';

interface BookmarkEditorProps {
  bookmark: BookmarkWithDetails;
}

export function BookmarkEditor({ bookmark }: BookmarkEditorProps) {
  const { folders, collections, tags } = useDataStore();
  const updateBookmark = useBookmarkStore((s) => s.updateBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const showToast = useToastStore((s) => s.showToast);

  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [description, setDescription] = useState(bookmark.description || '');
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(bookmark.folder_ids);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(bookmark.collection_ids);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(bookmark.tag_ids);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setDescription(bookmark.description || '');
    setSelectedFolderIds(bookmark.folder_ids);
    setSelectedCollectionIds(bookmark.collection_ids);
    setSelectedTagIds(bookmark.tag_ids);
    setHasChanges(false);
  }, [bookmark]);

  const handleSave = useCallback(async () => {
    await updateBookmark({
      id: bookmark.id,
      title,
      url,
      description: description || undefined,
      folder_ids: selectedFolderIds,
      collection_ids: selectedCollectionIds,
      tag_ids: selectedTagIds,
    });
    setHasChanges(false);
  }, [bookmark.id, title, url, description, selectedFolderIds, selectedCollectionIds, selectedTagIds, updateBookmark]);

  const handleDelete = useCallback(async () => {
    if (await confirmDialog('确定要删除这个书签吗？')) {
      await removeBookmark(bookmark.id);
    }
  }, [bookmark.id, removeBookmark]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          编辑书签
        </h3>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button
                className="btn text-xs"
                onClick={() => {
                  setTitle(bookmark.title);
                  setUrl(bookmark.url);
                  setDescription(bookmark.description || '');
                  setSelectedFolderIds(bookmark.folder_ids);
                  setSelectedCollectionIds(bookmark.collection_ids);
                  setSelectedTagIds(bookmark.tag_ids);
                  setHasChanges(false);
                }}
              >
                <FiX size={14} /> 撤销
              </button>
              <button className="btn btn-primary text-xs" onClick={handleSave}>
                <FiSave size={14} /> 保存
              </button>
            </>
          )}
          <button
            className="btn-icon"
            onClick={() => { copyToClipboard(url); showToast('已复制链接'); }}
            title="复制链接"
          >
            <FiCopy size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={() => { copyToClipboard(formatMarkdownLink(title, url)); showToast('已复制 Markdown 链接'); }}
            title="复制 Markdown 链接"
          >
            <span className="text-xs font-bold">MD</span>
          </button>
          <button
            className="btn-icon"
            onClick={() => openUrl(url)}
            title="在浏览器打开"
          >
            <FiExternalLink size={14} />
          </button>
          <button
            className="btn-icon"
            onClick={handleDelete}
            title="删除书签"
            style={{ color: 'var(--color-danger)' }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          className="input text-xs"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
          placeholder="标题"
        />
        <input
          className="input text-xs"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setHasChanges(true); }}
          placeholder="链接"
        />
        <textarea
          className="input text-xs"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
          placeholder="描述"
          rows={2}
          style={{ resize: 'vertical' }}
        />

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--color-text-tertiary)' }}>
            文件夹
          </label>
          <div className="flex flex-wrap gap-2.5">
            {folders.map((folder) => (
              <button
                key={folder.id}
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  background: selectedFolderIds.includes(folder.id) ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                  color: selectedFolderIds.includes(folder.id) ? 'white' : 'var(--color-text-secondary)',
                }}
                onClick={() => {
                  setSelectedFolderIds((prev) =>
                    prev.includes(folder.id) ? prev.filter((id) => id !== folder.id) : [...prev, folder.id]
                  );
                  setHasChanges(true);
                }}
              >
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--color-text-tertiary)' }}>
            合集
          </label>
          <div className="flex flex-wrap gap-2.5">
            {collections.map((collection) => (
              <button
                key={collection.id}
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  background: selectedCollectionIds.includes(collection.id) ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                  color: selectedCollectionIds.includes(collection.id) ? 'white' : 'var(--color-text-secondary)',
                }}
                onClick={() => {
                  setSelectedCollectionIds((prev) =>
                    prev.includes(collection.id) ? prev.filter((id) => id !== collection.id) : [...prev, collection.id]
                  );
                  setHasChanges(true);
                }}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--color-text-tertiary)' }}>
            标签
          </label>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  background: selectedTagIds.includes(tag.id) ? (tag.color || 'var(--color-accent)') : 'var(--color-bg-tertiary)',
                  color: selectedTagIds.includes(tag.id) ? 'white' : 'var(--color-text-secondary)',
                }}
                onClick={() => {
                  setSelectedTagIds((prev) =>
                    prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                  );
                  setHasChanges(true);
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}