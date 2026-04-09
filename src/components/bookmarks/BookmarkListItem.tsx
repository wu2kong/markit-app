import type { BookmarkWithDetails } from '../../types';
import { getDomainFromUrl, openUrl } from '../../utils/helpers';
import { Favicon } from '../common/Favicon';

interface BookmarkListItemProps {
  bookmark: BookmarkWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function BookmarkListItem({ bookmark, isSelected, onSelect, onContextMenu }: BookmarkListItemProps) {
  const domain = getDomainFromUrl(bookmark.url);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 mx-1.5 rounded-md cursor-pointer group transition-all select-none"
      style={{
        background: isSelected ? 'var(--color-accent-light)' : 'transparent',
      }}
      onClick={onSelect}
      onDoubleClick={() => openUrl(bookmark.url)}
      onContextMenu={onContextMenu}
    >
      <Favicon
        url={bookmark.favicon_url}
        domain={domain}
        size={18}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium truncate" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
            {bookmark.title}
          </h3>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {domain}
          </span>
        </div>
        {bookmark.description && (
          <p className="text-xs truncate mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            {bookmark.description}
          </p>
        )}
      </div>
    </div>
  );
}