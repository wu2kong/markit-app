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
  addWorkspace: (name: string, icon?: string, color?: string) => Promise<Workspace>;
  removeWorkspace: (id: string) => Promise<void>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  updateWorkspaceColor: (id: string, color: string) => Promise<void>;
  reorderWorkspaces: (workspaceIds: string[]) => Promise<void>;
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
          console.log('🔄 Loading workspaces...');
          const workspaces = await api.listWorkspaces();
          console.log('✅ Workspaces loaded:', workspaces);
          set({ workspaces, loading: false });
          if (!get().currentWorkspaceId && workspaces.length > 0) {
            console.log('📌 Setting current workspace:', workspaces[0].id);
            set({ currentWorkspaceId: workspaces[0].id });
          }
        } catch (e) {
          console.error('❌ Failed to load workspaces:', e);
          set({ loading: false });
        }
      },
      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
      addWorkspace: async (name, icon, color) => {
        const workspace = await api.createWorkspace({ name, icon, color });
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
      renameWorkspace: async (id, name) => {
        const workspace = await api.updateWorkspace({ id, name });
        const workspaces = get().workspaces.map((w) => w.id === id ? workspace : w);
        set({ workspaces });
      },
      updateWorkspaceColor: async (id, color) => {
        const workspace = await api.updateWorkspace({ id, color });
        const workspaces = get().workspaces.map((w) => w.id === id ? workspace : w);
        set({ workspaces });
      },
      reorderWorkspaces: async (workspaceIds) => {
        const updates = workspaceIds.map((id, index) => ({ id, sort_order: index }));
        const workspaces = await Promise.all(
          updates.map((u) => api.updateWorkspace(u))
        );
        set({ workspaces });
      },
    }),
    { name: 'markit-workspace', partialize: (state) => ({ currentWorkspaceId: state.currentWorkspaceId }) }
  )
);