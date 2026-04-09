import type { BookmarkWithDetails } from '../../types';
import { getDomainFromUrl, openUrl } from '../../utils/helpers';
import { Favicon } from '../common/Favicon';

interface BookmarkCompactItemProps {
  bookmark: BookmarkWithDetails;
  isSelected: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function BookmarkCompactItem({ bookmark, isSelected, onSelect, onContextMenu }: BookmarkCompactItemProps) {
  const domain = getDomainFromUrl(bookmark.url);

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 mx-1.5 rounded-md cursor-pointer group select-none"
      style={{
        background: isSelected ? 'var(--color-accent-light)' : 'transparent',
      }}
      onClick={onSelect}
      onDoubleClick={() => openUrl(bookmark.url)}
      onContextMenu={onContextMenu}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      <Favicon
        url={bookmark.favicon_url}
        domain={domain}
        size={14}
        className="shrink-0"
      />
      <span className="text-xs truncate" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)', flex: 1 }}>
        {bookmark.title}
      </span>
      <span className="text-xs shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
        {domain}
      </span>
    </div>
  );
}