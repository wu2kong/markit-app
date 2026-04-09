import { useViewStore } from '../../stores/useViewStore';
import { FiSearch } from 'react-icons/fi';

export function AppHeader() {
  const globalSearch = useViewStore((s) => s.globalSearch);
  const setGlobalSearch = useViewStore((s) => s.setGlobalSearch);

  return (
    <div
      className="flex items-center justify-center px-4 h-14 border-b drag-region"
      style={{ background: 'var(--color-bg-primary)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex-1 max-w-md no-drag">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="搜索书签、合集、标签..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}