import { useState, useCallback } from 'react';
import { useViewStore } from '../../stores/useViewStore';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useToastStore } from '../../stores/useToastStore';
import { parseUrlInput } from '../../utils/helpers';
import { FiPlus } from 'react-icons/fi';

export function AddBookmarkInput() {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const selection = useViewStore((s) => s.selection);
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || !currentWorkspaceId) return;
    const parsed = parseUrlInput(input.trim());
    if (!parsed) return;

    const bookmarkTitle = title.trim() || parsed.title;
    const folderIds = selection.type === 'folders' && selection.id ? [selection.id] : undefined;
    const collectionIds = selection.type === 'collections' && selection.id ? [selection.id] : undefined;
    const tagIds = selection.type === 'tags' && selection.id ? [selection.id] : undefined;

    try {
      const result = await addBookmark({
        workspace_id: currentWorkspaceId,
        url: parsed.url,
        title: bookmarkTitle,
        folder_ids: folderIds,
        collection_ids: collectionIds,
        tag_ids: tagIds,
      });

      if (result) {
        showToast('书签添加成功', 'success');
        setInput('');
        setTitle('');
        setIsExpanded(false);
      } else {
        showToast('添加书签失败，请重试', 'error');
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      showToast('添加书签失败，请重试', 'error');
    }
  }, [input, title, currentWorkspaceId, selection, addBookmark, showToast]);

  const handleInputChange = (value: string) => {
    setInput(value);
    const parsed = parseUrlInput(value);
    if (parsed && !title) {
      setTitle(parsed.title);
    }
  };

  return (
    <div
      className="border-t px-5 py-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
    >
      {isExpanded ? (
        <div className="flex flex-col gap-3">
          <input
            className="input text-xs"
            placeholder="链接或 Markdown 链接..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') { setIsExpanded(false); setInput(''); setTitle(''); }
            }}
            autoFocus
          />
          <input
            className="input text-xs"
            placeholder="标题（可选，留空自动获取网页标题）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') { setIsExpanded(false); setInput(''); setTitle(''); }
            }}
          />
          <div className="flex gap-3">
            <button className="btn btn-primary text-xs flex-1" onClick={handleSubmit}>
              <FiPlus size={14} />
              添加书签
            </button>
            <button className="btn btn-ghost text-xs" onClick={() => { setIsExpanded(false); setInput(''); setTitle(''); }}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 w-full text-xs py-2.5 px-3 rounded-md"
          style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-bg-tertiary)' }}
          onClick={() => setIsExpanded(true)}
        >
          <FiPlus size={14} />
          添加书签...
        </button>
      )}
    </div>
  );
}