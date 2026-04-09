import { create } from 'zustand';
import type { FolderWithChildren, Collection, TagWithChildren, Note, Folder, Tag } from '../types';
import * as api from '../utils/api';

interface DataState {
  folderTree: FolderWithChildren[];
  folders: Folder[];
  collections: Collection[];
  tagTree: TagWithChildren[];
  tags: Tag[];
  recentNotes: Note[];
  loading: boolean;
  loadAll: (workspaceId: string) => Promise<void>;
  refreshFolders: (workspaceId: string) => Promise<void>;
  refreshCollections: (workspaceId: string) => Promise<void>;
  refreshTags: (workspaceId: string) => Promise<void>;
  addFolder: (workspaceId: string, name: string, parentId?: string) => Promise<void>;
  addCollection: (workspaceId: string, name: string, description?: string) => Promise<void>;
  addTag: (workspaceId: string, name: string, color?: string, parentId?: string) => Promise<void>;
  updateFolder: (id: string, name: string, workspaceId: string) => Promise<void>;
  updateCollection: (id: string, name: string, workspaceId: string) => Promise<void>;
  updateTag: (id: string, name: string, workspaceId: string) => Promise<void>;
  removeFolder: (id: string, workspaceId: string) => Promise<void>;
  removeCollection: (id: string, workspaceId: string) => Promise<void>;
  removeTag: (id: string, workspaceId: string) => Promise<void>;
}

export const useDataStore = create<DataState>()((set, get) => ({
  folderTree: [],
  folders: [],
  collections: [],
  tagTree: [],
  tags: [],
  recentNotes: [],
  loading: false,

  loadAll: async (workspaceId) => {
    set({ loading: true });
    try {
      const [folderTree, folders, collections, tagTree, tags] = await Promise.all([
        api.getFolderTree(workspaceId),
        api.listFolders(workspaceId),
        api.listCollections(workspaceId),
        api.getTagTree(workspaceId),
        api.listTags(workspaceId),
      ]);
      set({ folderTree, folders, collections, tagTree, tags, loading: false });
    } catch (e) {
      console.error('Failed to load data:', e);
      set({ loading: false });
    }
  },

  refreshFolders: async (workspaceId) => {
    const [folderTree, folders] = await Promise.all([
      api.getFolderTree(workspaceId),
      api.listFolders(workspaceId),
    ]);
    set({ folderTree, folders });
  },

  refreshCollections: async (workspaceId) => {
    const collections = await api.listCollections(workspaceId);
    set({ collections });
  },

  refreshTags: async (workspaceId) => {
    const [tagTree, tags] = await Promise.all([
      api.getTagTree(workspaceId),
      api.listTags(workspaceId),
    ]);
    set({ tagTree, tags });
  },

  addFolder: async (workspaceId, name, parentId) => {
    await api.createFolder({ workspace_id: workspaceId, name, parent_id: parentId });
    await get().refreshFolders(workspaceId);
  },

  addCollection: async (workspaceId, name, description) => {
    await api.createCollection({ workspace_id: workspaceId, name, description });
    await get().refreshCollections(workspaceId);
  },

  addTag: async (workspaceId, name, color, parentId) => {
    await api.createTag({ workspace_id: workspaceId, name, color, parent_id: parentId });
    await get().refreshTags(workspaceId);
  },

  updateFolder: async (id, name, workspaceId) => {
    await api.updateFolder({ id, name });
    await get().refreshFolders(workspaceId);
  },

  updateCollection: async (id, name, workspaceId) => {
    await api.updateCollection({ id, name });
    await get().refreshCollections(workspaceId);
  },

  updateTag: async (id, name, workspaceId) => {
    await api.updateTag({ id, name });
    await get().refreshTags(workspaceId);
  },

  removeFolder: async (id, workspaceId) => {
    await api.deleteFolder(id);
    await get().refreshFolders(workspaceId);
  },

  removeCollection: async (id, workspaceId) => {
    await api.deleteCollection(id);
    await get().refreshCollections(workspaceId);
  },

  removeTag: async (id, workspaceId) => {
    await api.deleteTag(id);
    await get().refreshTags(workspaceId);
  },
}));