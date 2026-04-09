import { invoke } from '@tauri-apps/api/core';
import type {
  Workspace,
  Folder,
  FolderWithChildren,
  Collection,
  Tag,
  TagWithChildren,
  BookmarkWithDetails,
  Note,
  CreateWorkspaceInput,
  CreateFolderInput,
  CreateCollectionInput,
  CreateTagInput,
  CreateBookmarkInput,
  CreateNoteInput,
  ExportOptions,
} from '../types';

export interface PageMetadata {
  title: string | null;
  description: string | null;
  favicon_url: string | null;
}

// Workspaces
export const listWorkspaces = () => invoke<Workspace[]>('list_workspaces');
export const createWorkspace = (input: CreateWorkspaceInput) => invoke<Workspace>('create_workspace', { input });
export const updateWorkspace = (input: { id: string; name?: string; icon?: string }) => invoke<Workspace>('update_workspace', { input });
export const deleteWorkspace = (id: string) => invoke<void>('delete_workspace', { id });

// Folders
export const listFolders = (workspaceId: string) => invoke<Folder[]>('list_folders', { workspaceId });
export const getFolderTree = (workspaceId: string) => invoke<FolderWithChildren[]>('get_folder_tree', { workspaceId });
export const createFolder = (input: CreateFolderInput) => invoke<Folder>('create_folder', { input });
export const updateFolder = (input: { id: string; parent_id?: string; name?: string; sort_order?: number }) => invoke<Folder>('update_folder', { input });
export const deleteFolder = (id: string) => invoke<void>('delete_folder', { id });

// Collections
export const listCollections = (workspaceId: string) => invoke<Collection[]>('list_collections', { workspaceId });
export const createCollection = (input: CreateCollectionInput) => invoke<Collection>('create_collection', { input });
export const updateCollection = (input: { id: string; name?: string; description?: string; icon?: string; sort_order?: number }) => invoke<Collection>('update_collection', { input });
export const deleteCollection = (id: string) => invoke<void>('delete_collection', { id });

// Tags
export const listTags = (workspaceId: string) => invoke<Tag[]>('list_tags', { workspaceId });
export const getTagTree = (workspaceId: string) => invoke<TagWithChildren[]>('get_tag_tree', { workspaceId });
export const createTag = (input: CreateTagInput) => invoke<Tag>('create_tag', { input });
export const updateTag = (input: { id: string; parent_id?: string; name?: string; color?: string; sort_order?: number }) => invoke<Tag>('update_tag', { input });
export const deleteTag = (id: string) => invoke<void>('delete_tag', { id });

// Bookmarks
export const listAllBookmarks = (workspaceId: string) => invoke<BookmarkWithDetails[]>('list_all_bookmarks', { workspaceId });
export const listBookmarksByFolder = (folderId: string) => invoke<BookmarkWithDetails[]>('list_bookmarks_by_folder', { folderId });
export const listBookmarksByCollection = (collectionId: string) => invoke<BookmarkWithDetails[]>('list_bookmarks_by_collection', { collectionId });
export const listBookmarksByTag = (tagId: string) => invoke<BookmarkWithDetails[]>('list_bookmarks_by_tag', { tagId });
export const getBookmark = (id: string) => invoke<BookmarkWithDetails>('get_bookmark', { id });
export const createBookmark = (input: CreateBookmarkInput) => invoke<BookmarkWithDetails>('create_bookmark', { input });
export const updateBookmark = (input: { id: string; url?: string; title?: string; description?: string; favicon_url?: string; folder_ids?: string[]; collection_ids?: string[]; tag_ids?: string[] }) => invoke<BookmarkWithDetails>('update_bookmark', { input });
export const deleteBookmark = (id: string) => invoke<void>('delete_bookmark', { id });
export const searchBookmarks = (workspaceId: string, query: string) => invoke<BookmarkWithDetails[]>('search_bookmarks', { query: { workspace_id: workspaceId, query, search_type: 'all' } });
export const exportBookmarks = (options: ExportOptions) => invoke<string>('export_bookmarks', { options });

// Notes
export const listNotes = (bookmarkId: string) => invoke<Note[]>('list_notes', { bookmarkId });
export const createNote = (input: CreateNoteInput) => invoke<Note>('create_note', { input });
export const updateNote = (input: { id: string; content?: string }) => invoke<Note>('update_note', { input });
export const deleteNote = (id: string) => invoke<void>('delete_note', { id });
export const searchNotes = (workspaceId: string, query: string) => invoke<Note[]>('search_notes', { workspaceId, query });

// Metadata
export const fetchMetadata = (url: string) => invoke<PageMetadata>('fetch_metadata', { url });
export const downloadFavicon = (url: string, bookmarkUrl: string) =>
  invoke<string>('download_favicon', { url, bookmarkUrl });

// Favicon utils
export async function getFaviconSrc(faviconUrl: string | null): Promise<string | null> {
  if (!faviconUrl) return null;
  
  if (faviconUrl.startsWith('http://') || faviconUrl.startsWith('https://')) {
    return faviconUrl;
  }
  
  if (faviconUrl.startsWith('favicons/')) {
    const { convertFileSrc } = await import('@tauri-apps/api/core');
    const appDataDir = await getAppDataDir();
    if (appDataDir) {
      return convertFileSrc(`${appDataDir}/${faviconUrl}`);
    }
  }
  
  return faviconUrl;
}

let cachedAppDataDir: string | null = null;

async function getAppDataDir(): Promise<string | null> {
  if (cachedAppDataDir) return cachedAppDataDir;
  
  try {
    const { appDataDir } = await import('@tauri-apps/api/path');
    cachedAppDataDir = await appDataDir();
    return cachedAppDataDir;
  } catch {
    return null;
  }
}