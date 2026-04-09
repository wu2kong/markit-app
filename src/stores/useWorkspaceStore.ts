import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace } from '../types';
import * as api from '../utils/api';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  loading: boolean;
  load: () => Promise<void>;
  setCurrentWorkspace: (id: string) => void;
  addWorkspace: (name: string, icon?: string) => Promise<Workspace>;
  removeWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      loading: false,
      load: async () => {
        set({ loading: true });
        try {
          const workspaces = await api.listWorkspaces();
          set({ workspaces, loading: false });
          if (!get().currentWorkspaceId && workspaces.length > 0) {
            set({ currentWorkspaceId: workspaces[0].id });
          }
        } catch (e) {
          console.error('Failed to load workspaces:', e);
          set({ loading: false });
        }
      },
      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
      addWorkspace: async (name, icon) => {
        const workspace = await api.createWorkspace({ name, icon });
        const workspaces = [...get().workspaces, workspace];
        set({ workspaces, currentWorkspaceId: workspace.id });
        return workspace;
      },
      removeWorkspace: async (id) => {
        await api.deleteWorkspace(id);
        const workspaces = get().workspaces.filter((w) => w.id !== id);
        const currentWorkspaceId = get().currentWorkspaceId === id
          ? (workspaces[0]?.id ?? null)
          : get().currentWorkspaceId;
        set({ workspaces, currentWorkspaceId });
      },
    }),
    { name: 'markit-workspace', partialize: (state) => ({ currentWorkspaceId: state.currentWorkspaceId }) }
  )
);