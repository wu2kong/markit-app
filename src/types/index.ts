export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
}

export interface Collection {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  color: string | null;
  sort_order: number;
  bookmark_count: number;
  created_at: string;
  updated_at: string;
}

export interface TagWithChildren extends Tag {
  children: TagWithChildren[];
}

export interface Bookmark {
  id: string;
  workspace_id: string;
  url: string;
  title: string;
  description: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  bookmark_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface BookmarkWithDetails {
  id: string;
  workspace_id: string;
  url: string;
  title: string;
  description: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
  folder_ids: string[];
  collection_ids: string[];
  tag_ids: string[];
  notes: Note[];
}

export type ViewMode = 'folders' | 'collections' | 'tags' | 'notes';
export type DisplayMode = 'list' | 'card' | 'compact';
export type ThemeMode = 'light' | 'dark';

export interface SelectionState {
  type: ViewMode;
  id: string | null;
}

export interface CreateWorkspaceInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceInput {
  id: string;
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface CreateFolderInput {
  workspace_id: string;
  parent_id?: string;
  name: string;
}

export interface CreateCollectionInput {
  workspace_id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateTagInput {
  workspace_id: string;
  parent_id?: string;
  name: string;
  color?: string;
}

export interface CreateBookmarkInput {
  workspace_id: string;
  url: string;
  title: string;
  description?: string;
  favicon_url?: string;
  folder_ids?: string[];
  collection_ids?: string[];
  tag_ids?: string[];
}

export interface CreateNoteInput {
  bookmark_id: string;
  content: string;
}

export interface ExportOptions {
  workspace_id: string;
  format: 'csv' | 'json' | 'markdown';
  folder_id?: string;
  collection_id?: string;
  tag_id?: string;
}