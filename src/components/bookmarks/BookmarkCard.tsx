import type { BookmarkWithDetails } from '../../types';
import { getDomainFromUrl, formatDate, openUrl } from '../../utils/helpers';
import { Favicon } from '../common/Favicon';

interface BookmarkCardProps {
  bookmark: BookmarkWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function BookmarkCard({ bookmark, isSelected, onSelect, onContextMenu }: BookmarkCardProps) {
  const domain = getDomainFromUrl(bookmark.url);

  return (
    <div
      className="rounded-lg p-4 cursor-pointer transition-all group select-none"
      style={{
        background: isSelected ? 'var(--color-accent-light)' : 'var(--color-bg-secondary)',
        border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
      }}
      onClick={onSelect}
      onDoubleClick={() => openUrl(bookmark.url)}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Favicon
            url={bookmark.favicon_url}
            domain={domain}
            size={20}
            className="shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
              {bookmark.title}
            </h3>
            <p className="text-xs truncate mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {domain}
            </p>
          </div>
        </div>
      </div>

      {bookmark.description && (
        <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {bookmark.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2.5">
          {bookmark.notes.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}>
              {bookmark.notes.length} notes
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {formatDate(bookmark.created_at)}
        </span>
      </div>
    </div>
  );
}