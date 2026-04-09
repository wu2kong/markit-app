import { create } from 'zustand';
import type { BookmarkWithDetails, Note } from '../types';
import * as api from '../utils/api';

interface BookmarkState {
  bookmarks: BookmarkWithDetails[];
  selectedBookmark: BookmarkWithDetails | null;
  notes: Note[];
  loading: boolean;
  loadAll: (workspaceId: string) => Promise<void>;
  loadByFolder: (folderId: string) => Promise<void>;
  loadByCollection: (collectionId: string) => Promise<void>;
  loadByTag: (tagId: string) => Promise<void>;
  selectBookmark: (id: string) => Promise<void>;
  addBookmark: (input: Parameters<typeof api.createBookmark>[0]) => Promise<BookmarkWithDetails | null>;
  updateBookmark: (input: Parameters<typeof api.updateBookmark>[0]) => Promise<BookmarkWithDetails | null>;
  removeBookmark: (id: string) => Promise<void>;
  addNote: (bookmarkId: string, content: string) => Promise<void>;
  deleteNote: (id: string, bookmarkId: string) => Promise<void>;
  search: (workspaceId: string, query: string) => Promise<void>;
  clear: () => void;
}

export const useBookmarkStore = create<BookmarkState>()((set) => ({
  bookmarks: [],
  selectedBookmark: null,
  notes: [],
  loading: false,

  loadAll: async (workspaceId) => {
    set({ loading: true });
    try {
      const bookmarks = await api.listAllBookmarks(workspaceId);
      set({ bookmarks, loading: false });
    } catch (e) {
      console.error('Failed to load all bookmarks:', e);
      set({ loading: false });
    }
  },

  loadByFolder: async (folderId) => {
    set({ loading: true });
    try {
      const bookmarks = await api.listBookmarksByFolder(folderId);
      set({ bookmarks, loading: false });
    } catch (e) {
      console.error('Failed to load bookmarks by folder:', e);
      set({ loading: false });
    }
  },

  loadByCollection: async (collectionId) => {
    set({ loading: true });
    try {
      const bookmarks = await api.listBookmarksByCollection(collectionId);
      set({ bookmarks, loading: false });
    } catch (e) {
      console.error('Failed to load bookmarks by collection:', e);
      set({ loading: false });
    }
  },

  loadByTag: async (tagId) => {
    set({ loading: true });
    try {
      const bookmarks = await api.listBookmarksByTag(tagId);
      set({ bookmarks, loading: false });
    } catch (e) {
      console.error('Failed to load bookmarks by tag:', e);
      set({ loading: false });
    }
  },

  selectBookmark: async (id) => {
    try {
      const bookmark = await api.getBookmark(id);
      set({ selectedBookmark: bookmark, notes: bookmark.notes });
    } catch (e) {
      console.error('Failed to load bookmark:', e);
    }
  },

  addBookmark: async (input) => {
    try {
      const bookmark = await api.createBookmark(input);
      return bookmark;
    } catch (e) {
      console.error('Failed to create bookmark:', e);
      return null;
    }
  },

  updateBookmark: async (input) => {
    try {
      const bookmark = await api.updateBookmark(input);
      set((state) => ({
        bookmarks: state.bookmarks.map((b) => (b.id === bookmark.id ? bookmark : b)),
        selectedBookmark: state.selectedBookmark?.id === bookmark.id ? bookmark : state.selectedBookmark,
      }));
      return bookmark;
    } catch (e) {
      console.error('Failed to update bookmark:', e);
      return null;
    }
  },

  removeBookmark: async (id) => {
    try {
      await api.deleteBookmark(id);
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
        selectedBookmark: state.selectedBookmark?.id === id ? null : state.selectedBookmark,
      }));
    } catch (e) {
      console.error('Failed to delete bookmark:', e);
    }
  },

  addNote: async (bookmarkId, content) => {
    try {
      const note = await api.createNote({ bookmark_id: bookmarkId, content });
      set((state) => ({
        notes: [note, ...state.notes],
        selectedBookmark: state.selectedBookmark
          ? { ...state.selectedBookmark, notes: [note, ...state.selectedBookmark.notes] }
          : null,
      }));
    } catch (e) {
      console.error('Failed to create note:', e);
    }
  },

  deleteNote: async (id, _bookmarkId) => {
    try {
      await api.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedBookmark: state.selectedBookmark
          ? { ...state.selectedBookmark, notes: state.selectedBookmark.notes.filter((n) => n.id !== id) }
          : null,
      }));
    } catch (e) {
      console.error('Failed to delete note:', e);
    }
  },

  search: async (workspaceId, query) => {
    set({ loading: true });
    try {
      const bookmarks = await api.searchBookmarks(workspaceId, query);
      set({ bookmarks, loading: false });
    } catch (e) {
      console.error('Failed to search bookmarks:', e);
      set({ loading: false });
    }
  },

  clear: () => set({ bookmarks: [], selectedBookmark: null, notes: [], loading: false }),
}));