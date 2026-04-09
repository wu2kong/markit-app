import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewMode, DisplayMode, SelectionState } from '../types';

interface ViewState {
  viewMode: ViewMode;
  displayMode: DisplayMode;
  selection: SelectionState;
  sidebarSearch: string;
  globalSearch: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  bookmarkPanelWidth: number;
  bookmarkPanelCollapsed: boolean;
  setViewMode: (mode: ViewMode) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setSelection: (selection: SelectionState) => void;
  setSidebarSearch: (query: string) => void;
  setGlobalSearch: (query: string) => void;
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBookmarkPanelWidth: (width: number) => void;
  setBookmarkPanelCollapsed: (collapsed: boolean) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: 'folders',
      displayMode: 'card',
      selection: { type: 'folders', id: null },
      sidebarSearch: '',
      globalSearch: '',
      sidebarWidth: 280,
      sidebarCollapsed: false,
      bookmarkPanelWidth: 400,
      bookmarkPanelCollapsed: false,
      setViewMode: (viewMode) => set((state) => ({
        viewMode,
        selection: { type: viewMode, id: state.selection.id ? state.selection.id : null },
      })),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setSelection: (selection) => set({ selection }),
      setSidebarSearch: (sidebarSearch) => set({ sidebarSearch }),
      setGlobalSearch: (globalSearch) => set({ globalSearch }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setBookmarkPanelWidth: (bookmarkPanelWidth) => set({ bookmarkPanelWidth }),
      setBookmarkPanelCollapsed: (bookmarkPanelCollapsed) => set({ bookmarkPanelCollapsed }),
    }),
    {
      name: 'markit-view',
      partialize: (state) => ({
        viewMode: state.viewMode,
        displayMode: state.displayMode,
        sidebarWidth: state.sidebarWidth,
        sidebarCollapsed: state.sidebarCollapsed,
        bookmarkPanelWidth: state.bookmarkPanelWidth,
        bookmarkPanelCollapsed: state.bookmarkPanelCollapsed,
      })
    }
  )
);