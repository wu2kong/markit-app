use crate::db::models::{Collection, CreateCollection, UpdateCollection};
use uuid::Uuid;

#[tauri::command]
pub fn list_collections(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<Collection>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT c.id, c.workspace_id, c.name, c.description, c.icon, c.sort_order, \
             COUNT(DISTINCT bc.bookmark_id) as bookmark_count, c.created_at, c.updated_at \
             FROM collections c \
             LEFT JOIN bookmark_collections bc ON c.id = bc.collection_id \
             WHERE c.workspace_id = ?1 \
             GROUP BY c.id \
             ORDER BY c.sort_order, c.name",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&workspace_id], |row| {
            Ok(Collection {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                name: row.get(2)?,
                description: row.get(3)?,
                icon: row.get(4)?,
                sort_order: row.get(5)?,
                bookmark_count: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
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
pub fn create_collection(
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateCollection,
) -> Result<Collection, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    conn.execute(
        "INSERT INTO collections (id, workspace_id, name, description, icon, sort_order, created_at, updated_at) \
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7)",
        rusqlite::params![&id, &input.workspace_id, &input.name, &input.description, &input.icon, &now, &now],
    )
    .map_err(|e| e.to_string())?;
    Ok(Collection {
        id,
        workspace_id: input.workspace_id,
        name: input.name,
        description: input.description,
        icon: input.icon,
        sort_order: 0,
        bookmark_count: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_collection(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateCollection,
) -> Result<Collection, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let mut sets = vec!["updated_at = ?1".to_string()];
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = vec![Box::new(now.clone())];
    if let Some(ref name) = input.name {
        sets.push(format!("name = ?{}", params.len() + 1));
        params.push(Box::new(name.clone()));
    }
    if let Some(ref description) = input.description {
        sets.push(format!("description = ?{}", params.len() + 1));
        params.push(Box::new(description.clone()));
    }
    if let Some(ref icon) = input.icon {
        sets.push(format!("icon = ?{}", params.len() + 1));
        params.push(Box::new(icon.clone()));
    }
    if let Some(sort_order) = input.sort_order {
        sets.push(format!("sort_order = ?{}", params.len() + 1));
        params.push(Box::new(sort_order));
    }
    params.push(Box::new(input.id.clone()));
    let sql = format!("UPDATE collections SET {} WHERE id = ?", sets.join(", "));
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql.as_str(), param_refs.as_slice())
        .map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, workspace_id, name, description, icon, sort_order, 0 as bookmark_count, created_at, updated_at FROM collections WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    stmt.query_row([&input.id], |row| {
        Ok(Collection {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            icon: row.get(4)?,
            sort_order: row.get(5)?,
            bookmark_count: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_collection(
    state: tauri::State<'_, crate::db::DbState>,
    id: String,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM collections WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
