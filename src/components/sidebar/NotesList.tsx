import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { FiFileText } from 'react-icons/fi';
import * as api from '../../utils/api';
import { useEffect, useState } from 'react';
import type { Note, ViewMode } from '../../types';

interface NotesListProps {
  searchQuery: string;
  onSelect: (type: ViewMode, id: string) => void;
}

export function NotesList({ searchQuery, onSelect }: NotesListProps) {
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    setLoading(true);
    if (searchQuery) {
      api.searchNotes(currentWorkspaceId, searchQuery).then((result) => {
        setNotes(result);
        setLoading(false);
      });
    } else {
      api.searchNotes(currentWorkspaceId, '').then((result) => {
        setNotes(result.slice(0, 50));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [currentWorkspaceId, searchQuery]);

  if (loading) {
    return <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Loading...</div>;
  }

  if (notes.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        暂无笔记
      </div>
    );
  }

  return (
    <div className="py-1">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-start gap-2.5 px-3 py-2.5 mx-1 rounded-md cursor-pointer text-xs group"
          style={{ background: 'transparent' }}
          onClick={() => onSelect('notes' as ViewMode, note.id)}
        >
          <FiFileText size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--color-accent)' }} />
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ color: 'var(--color-text-primary)' }}>
              {note.content.slice(0, 80)}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              {note.created_at}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}