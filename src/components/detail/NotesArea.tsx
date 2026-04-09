import { useState, useCallback } from 'react';
import type { BookmarkWithDetails } from '../../types';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { FiSend, FiTrash2 } from 'react-icons/fi';

interface NotesAreaProps {
  bookmark: BookmarkWithDetails;
}

export function NotesArea({ bookmark }: NotesAreaProps) {
  const [noteContent, setNoteContent] = useState('');
  const addNote = useBookmarkStore((s) => s.addNote);
  const deleteNote = useBookmarkStore((s) => s.deleteNote);
  const notes = bookmark.notes;

  const handleSubmit = useCallback(async () => {
    if (!noteContent.trim()) return;
    await addNote(bookmark.id, noteContent.trim());
    setNoteContent('');
  }, [noteContent, bookmark.id, addNote]);

  const handleDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId, bookmark.id);
  }, [deleteNote, bookmark.id]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-4">
        <label className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          笔记 & 想法
        </label>
      </div>

      <div className="px-5 py-3">
        <div className="relative">
          <textarea
            className="input text-xs"
            placeholder="写下笔记或想法..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={3}
            style={{ resize: 'none', paddingRight: 36 }}
          />
          <button
            className="absolute right-2 bottom-2 btn-icon"
            style={{ width: 28, height: 28, color: 'var(--color-accent)' }}
            onClick={handleSubmit}
            disabled={!noteContent.trim()}
          >
            <FiSend size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {notes.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>
            暂无笔记，在上方添加。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-md p-4 group relative"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-light)' }}
              >
                <p className="text-xs whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
                  {note.content}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {note.created_at}
                  </span>
                  <button
                    className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ width: 24, height: 24, color: 'var(--color-danger)' }}
                    onClick={() => {
                      if (confirm('确定要删除这条笔记吗？')) {
                        handleDelete(note.id);
                      }
                    }}
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}