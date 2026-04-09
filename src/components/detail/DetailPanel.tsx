import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useViewStore } from '../../stores/useViewStore';
import { BookmarkEditor } from './BookmarkEditor';
import { NotesArea } from './NotesArea';

export function DetailPanel() {
  const selectedBookmark = useBookmarkStore((s) => s.selectedBookmark);
  const viewMode = useViewStore((s) => s.viewMode);

  if (!selectedBookmark) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center h-full"
        style={{
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        <div className="text-center px-6 py-8" style={{ color: 'var(--color-text-tertiary)' }}>
          <p className="text-sm">Select a bookmark to view details</p>
          <p className="text-xs mt-3">{viewMode === 'folders' ? 'Click a folder, then a bookmark' : viewMode === 'collections' ? 'Click a collection, then a bookmark' : viewMode === 'tags' ? 'Click a tag, then a bookmark' : 'Click a note, then a bookmark'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-panel-container flex-1 h-full">
      <div
        className="detail-panel-layout flex h-full overflow-hidden"
        style={{
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
        }}
      >
        <div
          className="editor-area flex flex-col h-full"
          style={{
            flex: '0 1 var(--editor-max-width)',
            minWidth: 320,
            maxWidth: 'var(--editor-max-width)',
          }}
        >
          <BookmarkEditor bookmark={selectedBookmark} />
        </div>
        <div
          className="notes-area flex flex-col h-full"
          style={{
            flex: '1 1 280px',
            minWidth: 280,
          }}
        >
          <NotesArea bookmark={selectedBookmark} />
        </div>
      </div>
    </div>
  );
}