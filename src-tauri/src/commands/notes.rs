use crate::db::models::{CreateNote, Note, UpdateNote};
use uuid::Uuid;

#[tauri::command]
pub fn list_notes(
    state: tauri::State<'_, crate::db::DbState>,
    bookmark_id: String,
) -> Result<Vec<Note>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, bookmark_id, content, created_at, updated_at FROM notes WHERE bookmark_id = ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&bookmark_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                bookmark_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
pub fn create_note(
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateNote,
) -> Result<Note, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    conn.execute(
        "INSERT INTO notes (id, bookmark_id, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![&id, &input.bookmark_id, &input.content, &now, &now],
    )
    .map_err(|e| e.to_string())?;
    Ok(Note {
        id,
        bookmark_id: input.bookmark_id,
        content: input.content,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_note(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateNote,
) -> Result<Note, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    if let Some(ref content) = input.content {
        conn.execute(
            "UPDATE notes SET content = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![content, &now, &input.id],
        )
        .map_err(|e| e.to_string())?;
    }
    let mut stmt = conn
        .prepare("SELECT id, bookmark_id, content, created_at, updated_at FROM notes WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    stmt.query_row([&input.id], |row| {
        Ok(Note {
            id: row.get(0)?,
            bookmark_id: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_note(state: tauri::State<'_, crate::db::DbState>, id: String) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[allow(dead_code)]
#[tauri::command]
pub fn search_notes(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
    query: String,
) -> Result<Vec<Note>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let pattern = format!("%{}%", query);
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.bookmark_id, n.content, n.created_at, n.updated_at \
             FROM notes n \
             INNER JOIN bookmarks b ON n.bookmark_id = b.id \
             WHERE b.workspace_id = ?1 AND n.content LIKE ?2 \
             ORDER BY n.created_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![&workspace_id, &pattern], |row| {
            Ok(Note {
                id: row.get(0)?,
                bookmark_id: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for row in rows {
        result.push(row.map_err(|e| e.to_string())?);
    }
    Ok(result)
}
