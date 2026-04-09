use crate::db::models::{CreateTag, Tag, TagWithChildren, UpdateTag};
use uuid::Uuid;

#[tauri::command]
pub fn list_tags(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<Tag>, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.workspace_id, t.parent_id, t.name, t.color, t.sort_order, \
             COUNT(DISTINCT bt.bookmark_id) as bookmark_count, t.created_at, t.updated_at \
             FROM tags t \
             LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id \
             WHERE t.workspace_id = ?1 \
             GROUP BY t.id \
             ORDER BY t.sort_order, t.name",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([&workspace_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                parent_id: row.get(2)?,
                name: row.get(3)?,
                color: row.get(4)?,
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
pub fn get_tag_tree(
    state: tauri::State<'_, crate::db::DbState>,
    workspace_id: String,
) -> Result<Vec<TagWithChildren>, String> {
    let tags = list_tags(state.clone(), workspace_id)?;
    Ok(build_tag_tree(&tags, None))
}

fn build_tag_tree(tags: &[Tag], parent_id: Option<&str>) -> Vec<TagWithChildren> {
    tags.iter()
        .filter(|t| match (parent_id, &t.parent_id) {
            (None, None) => true,
            (Some(p), Some(tp)) => p == tp.as_str(),
            _ => false,
        })
        .map(|t| {
            let children = build_tag_tree(tags, Some(&t.id));
            TagWithChildren {
                tag: t.clone(),
                children,
            }
        })
        .collect()
}

#[tauri::command]
pub fn create_tag(
    state: tauri::State<'_, crate::db::DbState>,
    input: CreateTag,
) -> Result<Tag, String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now()
        .naive_utc()
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    let parent_id = input.parent_id.clone();
    conn.execute(
        "INSERT INTO tags (id, workspace_id, parent_id, name, color, sort_order, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7)",
        rusqlite::params![&id, &input.workspace_id, &input.parent_id, &input.name, &input.color, &now, &now],
    )
    .map_err(|e| e.to_string())?;
    Ok(Tag {
        id,
        workspace_id: input.workspace_id,
        parent_id,
        name: input.name,
        color: input.color,
        sort_order: 0,
        bookmark_count: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_tag(
    state: tauri::State<'_, crate::db::DbState>,
    input: UpdateTag,
) -> Result<Tag, String> {
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
    if let Some(ref color) = input.color {
        sets.push(format!("color = ?{}", params.len() + 1));
        params.push(Box::new(color.clone()));
    }
    if let Some(sort_order) = input.sort_order {
        sets.push(format!("sort_order = ?{}", params.len() + 1));
        params.push(Box::new(sort_order));
    }
    params.push(Box::new(input.id.clone()));
    let sql = format!("UPDATE tags SET {} WHERE id = ?", sets.join(", "));
    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    conn.execute(sql.as_str(), param_refs.as_slice())
        .map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT t.id, t.workspace_id, t.parent_id, t.name, t.color, t.sort_order, 0 as bookmark_count, t.created_at, t.updated_at FROM tags t WHERE t.id = ?1")
        .map_err(|e| e.to_string())?;
    stmt.query_row([&input.id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            parent_id: row.get(2)?,
            name: row.get(3)?,
            color: row.get(4)?,
            sort_order: row.get(5)?,
            bookmark_count: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_tag(state: tauri::State<'_, crate::db::DbState>, id: String) -> Result<(), String> {
    let conn = state.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
