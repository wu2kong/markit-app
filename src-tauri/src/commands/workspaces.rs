use crate::db::models::{CreateWorkspace, UpdateWorkspace, Workspace};
use uuid::Uuid;

#[tauri::command]
pub fn list_workspaces(
    state: tauri::State<'_, crate::db::DbState>,
) -> Result<Vec<Workspace>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, name, icon, color, sort_order, created_at, updated_at FROM workspaces ORDER BY sort_order",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Workspace {
                id: row.get(0)?,
                name: row.get(1)?,
                icon: row.get(2)?,
                color: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
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
pub fn create_workspace(
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateWorkspace,
) -> Result<Workspace, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let max_sort_order: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(sort_order), -1) FROM workspaces",
            [],
            |row| row.get(0),
        )
        .unwrap_or(-1);
    let sort_order = max_sort_order + 1;
    conn.execute(
        "INSERT INTO workspaces (id, name, icon, color, sort_order, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [&id, &input.name, &input.icon.clone().unwrap_or_default(), &input.color.clone().unwrap_or_default(), &sort_order.to_string(), &now, &now],
    )
    .map_err(|e| e.to_string())?;
    Ok(Workspace {
        id,
        name: input.name,
        icon: input.icon,
        color: input.color,
        sort_order,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_workspace(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateWorkspace,
) -> Result<Workspace, String> {
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
    if let Some(ref icon) = input.icon {
        sets.push(format!("icon = ?{}", params.len() + 1));
        params.push(Box::new(icon.clone()));
    }
    if let Some(ref color) = input.color {
        sets.push(format!("color = ?{}", params.len() + 1));
        params.push(Box::new(color.clone()));
    }
    if let Some(sort_order) = input.sort_order {
        sets.push(format!("sort_order = ?{}", params.len() + 1));
        params.push(Box::new(sort_order));
    }
    params.push(Box::new(input.id.clone()));
    let sql = format!("UPDATE workspaces SET {} WHERE id = ?", sets.join(", "));
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql.as_str(), param_refs.as_slice())
        .map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, icon, color, sort_order, created_at, updated_at FROM workspaces WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    let workspace = stmt
        .query_row([&input.id], |row| {
            Ok(Workspace {
                id: row.get(0)?,
                name: row.get(1)?,
                icon: row.get(2)?,
                color: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(workspace)
}

#[tauri::command]
pub fn delete_workspace(
    state: tauri::State<'_, crate::db::DbState>,
    id: String,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM workspaces WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
