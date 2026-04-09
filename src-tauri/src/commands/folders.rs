use crate::db::models::{CreateFolder, Folder, FolderWithChildren, UpdateFolder};
use uuid::Uuid;

#[tauri::command]
pub fn list_folders(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<Folder>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT f.id, f.workspace_id, f.parent_id, f.name, f.sort_order, \
             COUNT(DISTINCT bf.bookmark_id) as bookmark_count, f.created_at, f.updated_at \
             FROM folders f \
             LEFT JOIN bookmark_folders bf ON f.id = bf.folder_id \
             WHERE f.workspace_id = ?1 \
             GROUP BY f.id \
             ORDER BY f.sort_order, f.name",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&workspace_id], |row| {
            Ok(Folder {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                parent_id: row.get(2)?,
                name: row.get(3)?,
                sort_order: row.get(4)?,
                bookmark_count: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
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
pub fn get_folder_tree(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<FolderWithChildren>, String> {
    let folders = list_folders(state.clone(), workspace_id)?;
    Ok(build_folder_tree(&folders, None))
}

fn build_folder_tree(folders: &[Folder], parent_id: Option<&str>) -> Vec<FolderWithChildren> {
    folders
        .iter()
        .filter(|f| match (parent_id, &f.parent_id) {
            (None, None) => true,
            (Some(p), Some(fp)) => p == fp.as_str(),
            _ => false,
        })
        .map(|f| {
            let children = build_folder_tree(folders, Some(&f.id));
            FolderWithChildren {
                folder: f.clone(),
                children,
            }
        })
        .collect()
}

#[tauri::command]
pub fn create_folder(
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateFolder,
) -> Result<Folder, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let parent_id = input.parent_id.clone();
    conn.execute(
        "INSERT INTO folders (id, workspace_id, parent_id, name, sort_order, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6)",
        rusqlite::params![&id, &input.workspace_id, &input.parent_id, &input.name, &now, &now],
    )
    .map_err(|e| e.to_string())?;
    Ok(Folder {
        id,
        workspace_id: input.workspace_id,
        parent_id,
        name: input.name,
        sort_order: 0,
        bookmark_count: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_folder(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateFolder,
) -> Result<Folder, String> {
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
    if let Some(ref parent_id) = input.parent_id {
        sets.push(format!("parent_id = ?{}", params.len() + 1));
        params.push(Box::new(parent_id.clone()));
    }
    if let Some(sort_order) = input.sort_order {
        sets.push(format!("sort_order = ?{}", params.len() + 1));
        params.push(Box::new(sort_order));
    }
    params.push(Box::new(input.id.clone()));
    let sql = format!("UPDATE folders SET {} WHERE id = ?", sets.join(", "));
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql.as_str(), param_refs.as_slice())
        .map_err(|e| e.to_string())?;
    let folders = {
        let mut stmt = conn
            .prepare("SELECT f.id, f.workspace_id, f.parent_id, f.name, f.sort_order, 0 as bookmark_count, f.created_at, f.updated_at FROM folders f WHERE f.id = ?1")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([&input.id], |row| {
                Ok(Folder {
                    id: row.get(0)?,
                    workspace_id: row.get(1)?,
                    parent_id: row.get(2)?,
                    name: row.get(3)?,
                    sort_order: row.get(4)?,
                    bookmark_count: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?
    };
    folders
        .into_iter()
        .next()
        .ok_or("Folder not found".to_string())
}

#[tauri::command]
pub fn delete_folder(
    state: tauri::State<'_, crate::db::DbState>,
    id: String,
) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM folders WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
