use rusqlite::Connection;
use tauri::AppHandle;
use tauri::Manager;

pub fn init_db(app: &AppHandle) -> Result<Connection, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app data dir: {}", e))?;

    let db_path = app_dir.join("markit.db");
    let conn = Connection::open(&db_path).map_err(|e| format!("Failed to open database: {}", e))?;

    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
        .map_err(|e| format!("Failed to set pragmas: {}", e))?;

    create_tables(&conn)?;
    Ok(conn)
}

fn create_tables(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            parent_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            parent_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            color TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            favicon_url TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS bookmark_folders (
            bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
            folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
            PRIMARY KEY (bookmark_id, folder_id)
        );

        CREATE TABLE IF NOT EXISTS bookmark_collections (
            bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
            collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
            PRIMARY KEY (bookmark_id, collection_id)
        );

        CREATE TABLE IF NOT EXISTS bookmark_tags (
            bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
            tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (bookmark_id, tag_id)
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            bookmark_id TEXT NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
        CREATE INDEX IF NOT EXISTS idx_collections_workspace ON collections(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_tags_workspace ON tags(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_tags_parent ON tags(parent_id);
        CREATE INDEX IF NOT EXISTS idx_bookmarks_workspace ON bookmarks(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_notes_bookmark ON notes(bookmark_id);
        CREATE INDEX IF NOT EXISTS idx_bookmark_folders_bookmark ON bookmark_folders(bookmark_id);
        CREATE INDEX IF NOT EXISTS idx_bookmark_collections_bookmark ON bookmark_collections(bookmark_id);
        CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark ON bookmark_tags(bookmark_id);
        "
    ).map_err(|e| format!("Failed to create tables: {}", e))?;

    Ok(())
}
