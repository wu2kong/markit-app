use crate::db::models::{
    Bookmark, BookmarkWithDetails, CreateBookmark, Note, SearchQuery, UpdateBookmark,
};
use uuid::Uuid;

#[tauri::command]
pub fn list_all_bookmarks(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, workspace_id, url, title, description, favicon_url, created_at, updated_at \
             FROM bookmarks \
             WHERE workspace_id = ?1 \
             ORDER BY created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&workspace_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[tauri::command]
pub fn list_bookmarks_by_folder(
    state: tauri::State<'_, crate::db::DbState>,
    folder_id: String,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
             FROM bookmarks b \
             INNER JOIN bookmark_folders bf ON b.id = bf.bookmark_id \
             WHERE bf.folder_id = ?1 \
             ORDER BY b.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&folder_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[tauri::command]
pub fn list_bookmarks_by_collection(
    state: tauri::State<'_, crate::db::DbState>,
    collection_id: String,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
             FROM bookmarks b \
             INNER JOIN bookmark_collections bc ON b.id = bc.bookmark_id \
             WHERE bc.collection_id = ?1 \
             ORDER BY b.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&collection_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[tauri::command]
pub fn list_bookmarks_by_tag(
    state: tauri::State<'_, crate::db::DbState>,
    tag_id: String,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
             FROM bookmarks b \
             INNER JOIN bookmark_tags bt ON b.id = bt.bookmark_id \
             WHERE bt.tag_id = ?1 \
             ORDER BY b.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&tag_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[allow(dead_code)]
#[tauri::command]
pub fn list_bookmarks_by_note(
    state: tauri::State<'_, crate::db::DbState>,
    note_id: String,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
             FROM bookmarks b \
             INNER JOIN notes n ON b.id = n.bookmark_id \
             WHERE n.id = ?1 \
             ORDER BY b.created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&note_id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[tauri::command]
pub fn get_bookmark(
    state: tauri::State<'_, crate::db::DbState>,
    id: String,
) -> Result<BookmarkWithDetails, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, workspace_id, url, title, description, favicon_url, created_at, updated_at FROM bookmarks WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let bookmark = stmt
        .query_row([&id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    enrich_bookmark(&conn, bookmark)
}

#[tauri::command]
pub async fn create_bookmark(
    app: tauri::AppHandle,
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateBookmark,
) -> Result<BookmarkWithDetails, String> {
    let mut final_title = input.title.clone();
    let mut final_favicon_url = input.favicon_url.clone();

    if final_title.is_empty() || final_favicon_url.is_none() {
        if let Ok(metadata) = super::metadata::fetch_page_metadata(&input.url).await {
            if final_title.is_empty() {
                final_title = metadata.title.unwrap_or_else(|| {
                    input
                        .url
                        .split('/')
                        .nth(2)
                        .unwrap_or("Untitled")
                        .to_string()
                });
            }
            if final_favicon_url.is_none() {
                if let Some(fav_url) = metadata.favicon_url {
                    final_favicon_url = super::metadata::download_favicon_internal(&app, &fav_url, &input.url)
                        .await
                        .ok();
                }
            }
        }
    }

    if final_title.is_empty() {
        final_title = input
            .url
            .split('/')
            .nth(2)
            .unwrap_or("Untitled")
            .to_string();
    }

    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let description = input.description.clone().unwrap_or_default();
    let favicon_url = final_favicon_url.clone().unwrap_or_default();
    conn.execute(
        "INSERT INTO bookmarks (id, workspace_id, url, title, description, favicon_url, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![&id, &input.workspace_id, &input.url, &final_title, &description, &favicon_url, &now, &now],
    )
    .map_err(|e| e.to_string())?;

    if let Some(ref folder_ids) = input.folder_ids {
        for folder_id in folder_ids {
            conn.execute(
                "INSERT INTO bookmark_folders (bookmark_id, folder_id) VALUES (?1, ?2)",
                rusqlite::params![&id, folder_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    if let Some(ref collection_ids) = input.collection_ids {
        for collection_id in collection_ids {
            conn.execute(
                "INSERT INTO bookmark_collections (bookmark_id, collection_id) VALUES (?1, ?2)",
                rusqlite::params![&id, collection_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    if let Some(ref tag_ids) = input.tag_ids {
        for tag_id in tag_ids {
            conn.execute(
                "INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?1, ?2)",
                rusqlite::params![&id, tag_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    let bookmark = Bookmark {
        id,
        workspace_id: input.workspace_id,
        url: input.url,
        title: input.title,
        description: Some(description),
        favicon_url: Some(favicon_url),
        created_at: now.clone(),
        updated_at: now,
    };
    enrich_bookmark(&conn, bookmark)
}

#[tauri::command]
pub fn update_bookmark(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateBookmark,
) -> Result<BookmarkWithDetails, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let mut sets = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(now.clone())];
    if let Some(ref url) = input.url {
        sets.push(format!("url = ?{}", params.len() + 1));
        params.push(Box::new(url.clone()));
    }
    if let Some(ref title) = input.title {
        sets.push(format!("title = ?{}", params.len() + 1));
        params.push(Box::new(title.clone()));
    }
    if let Some(ref description) = input.description {
        sets.push(format!("description = ?{}", params.len() + 1));
        params.push(Box::new(description.clone()));
    }
    if let Some(ref favicon_url) = input.favicon_url {
        sets.push(format!("favicon_url = ?{}", params.len() + 1));
        params.push(Box::new(favicon_url.clone()));
    }
    params.push(Box::new(input.id.clone()));
    let sql = format!("UPDATE bookmarks SET {} WHERE id = ?", sets.join(", "));
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql.as_str(), param_refs.as_slice())
        .map_err(|e| e.to_string())?;

    if let Some(ref folder_ids) = input.folder_ids {
        conn.execute(
            "DELETE FROM bookmark_folders WHERE bookmark_id = ?1",
            [&input.id],
        )
        .map_err(|e| e.to_string())?;
        for folder_id in folder_ids {
            conn.execute(
                "INSERT INTO bookmark_folders (bookmark_id, folder_id) VALUES (?1, ?2)",
                rusqlite::params![&input.id, folder_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    if let Some(ref collection_ids) = input.collection_ids {
        conn.execute(
            "DELETE FROM bookmark_collections WHERE bookmark_id = ?1",
            [&input.id],
        )
        .map_err(|e| e.to_string())?;
        for collection_id in collection_ids {
            conn.execute(
                "INSERT INTO bookmark_collections (bookmark_id, collection_id) VALUES (?1, ?2)",
                rusqlite::params![&input.id, collection_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    if let Some(ref tag_ids) = input.tag_ids {
        conn.execute(
            "DELETE FROM bookmark_tags WHERE bookmark_id = ?1",
            [&input.id],
        )
        .map_err(|e| e.to_string())?;
        for tag_id in tag_ids {
            conn.execute(
                "INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?1, ?2)",
                rusqlite::params![&input.id, tag_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    let mut stmt = conn
        .prepare("SELECT id, workspace_id, url, title, description, favicon_url, created_at, updated_at FROM bookmarks WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let bookmark = stmt
        .query_row([&input.id], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    enrich_bookmark(&conn, bookmark)
}

#[tauri::command]
pub fn delete_bookmark(
    state: tauri::State<'_, crate::db::DbState>,
    id: String,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM bookmarks WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn search_bookmarks(
    state: tauri::State<'_, crate::db::DbState>,
    query: SearchQuery,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let pattern = format!("%{}%", query.query);
    let mut stmt = conn
        .prepare(
            "SELECT id, workspace_id, url, title, description, favicon_url, created_at, updated_at \
             FROM bookmarks \
             WHERE workspace_id = ?1 AND (title LIKE ?2 OR url LIKE ?2 OR description LIKE ?2) \
             ORDER BY created_at DESC"
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![&query.workspace_id, &pattern], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(&conn, bookmark)?);
    }
    Ok(result)
}

#[tauri::command]
pub fn export_bookmarks(
    state: tauri::State<'_, crate::db::DbState>,
    options: crate::db::models::ExportOptions,
) -> Result<String, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let bookmarks = get_export_bookmarks(&conn, &options)?;
    match options.format.as_str() {
        "json" => serde_json::to_string_pretty(&bookmarks).map_err(|e| e.to_string()),
        "csv" => export_csv(&bookmarks),
        "markdown" => export_markdown(&bookmarks),
        _ => Err("Unsupported export format".to_string()),
    }
}

fn get_export_bookmarks(
    conn: &rusqlite::Connection,
    options: &crate::db::models::ExportOptions,
) -> Result<Vec<BookmarkWithDetails>, String> {
    let (sql, param): (String, &str) = if let Some(ref folder_id) = options.folder_id {
        ("SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
         FROM bookmarks b INNER JOIN bookmark_folders bf ON b.id = bf.bookmark_id WHERE bf.folder_id = ?1".to_string(), folder_id.as_str())
    } else if let Some(ref collection_id) = options.collection_id {
        ("SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
         FROM bookmarks b INNER JOIN bookmark_collections bc ON b.id = bc.bookmark_id WHERE bc.collection_id = ?1".to_string(), collection_id.as_str())
    } else if let Some(ref tag_id) = options.tag_id {
        ("SELECT b.id, b.workspace_id, b.url, b.title, b.description, b.favicon_url, b.created_at, b.updated_at \
         FROM bookmarks b INNER JOIN bookmark_tags bt ON b.id = bt.bookmark_id WHERE bt.tag_id = ?1".to_string(), tag_id.as_str())
    } else {
        ("SELECT id, workspace_id, url, title, description, favicon_url, created_at, updated_at FROM bookmarks WHERE workspace_id = ?1".to_string(), options.workspace_id.as_str())
    };
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([param], |row| {
            Ok(Bookmark {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                url: row.get(2)?,
                title: row.get(3)?,
                description: row.get(4)?,
                favicon_url: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        let bookmark = row.map_err(|e| e.to_string())?;
        result.push(enrich_bookmark(conn, bookmark)?);
    }
    Ok(result)
}

fn export_csv(bookmarks: &[BookmarkWithDetails]) -> Result<String, String> {
    let mut csv = String::from("title,url,description,folders,collections,tags\n");
    for b in bookmarks {
        let folders = b.folder_ids.join(";");
        let collections = b.collection_ids.join(";");
        let tags = b.tag_ids.join(";");
        csv.push_str(&format!(
            "{},{},{},{},{},{}\n",
            escape_csv(&b.bookmark.title),
            escape_csv(&b.bookmark.url),
            escape_csv(b.bookmark.description.as_deref().unwrap_or("")),
            escape_csv(&folders),
            escape_csv(&collections),
            escape_csv(&tags),
        ));
    }
    Ok(csv)
}

fn escape_csv(s: &str) -> String {
    if s.contains(',') || s.contains('"') || s.contains('\n') {
        format!("\"{}\"", s.replace('"', "\"\""))
    } else {
        s.to_string()
    }
}

fn export_markdown(bookmarks: &[BookmarkWithDetails]) -> Result<String, String> {
    let mut md = String::from("# Bookmarks\n\n");
    for b in bookmarks {
        md.push_str(&format!("- [{}]({})\n", b.bookmark.title, b.bookmark.url));
        if let Some(ref desc) = b.bookmark.description {
            if !desc.is_empty() {
                md.push_str(&format!("  > {}\n", desc));
            }
        }
    }
    Ok(md)
}

fn enrich_bookmark(
    conn: &rusqlite::Connection,
    bookmark: Bookmark,
) -> Result<BookmarkWithDetails, String> {
    let folder_ids = get_relations(
        conn,
        "SELECT folder_id FROM bookmark_folders WHERE bookmark_id = ?1",
        &bookmark.id,
    )?;
    let collection_ids = get_relations(
        conn,
        "SELECT collection_id FROM bookmark_collections WHERE bookmark_id = ?1",
        &bookmark.id,
    )?;
    let tag_ids = get_relations(
        conn,
        "SELECT tag_id FROM bookmark_tags WHERE bookmark_id = ?1",
        &bookmark.id,
    )?;

    let mut stmt = conn
        .prepare("SELECT id, bookmark_id, content, created_at, updated_at FROM notes WHERE bookmark_id = ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let notes: Vec<Note> = stmt
        .query_map([&bookmark.id], |row| {
            Ok(Note {
                id: row.get(0)?,
                bookmark_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|n| n.ok())
        .collect();

    Ok(BookmarkWithDetails {
        bookmark,
        folder_ids,
        collection_ids,
        tag_ids,
        notes,
    })
}

fn get_relations(conn: &rusqlite::Connection, sql: &str, id: &str) -> Result<Vec<String>, String> {
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let rows: Vec<String> = stmt
        .query_map([id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    Ok(rows)
}
