mod commands;
mod db;

use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

pub type DbState = Mutex<Connection>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Info)
                .level_for("html5ever", log::LevelFilter::Warn)
                .level_for("scraper", log::LevelFilter::Warn)
                .build()
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let conn = db::init::init_db(&app_handle)?;
            app.manage(DbState::new(conn));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::workspaces::list_workspaces,
            commands::workspaces::create_workspace,
            commands::workspaces::update_workspace,
            commands::workspaces::delete_workspace,
            commands::folders::list_folders,
            commands::folders::get_folder_tree,
            commands::folders::create_folder,
            commands::folders::update_folder,
            commands::folders::delete_folder,
            commands::collections::list_collections,
            commands::collections::create_collection,
            commands::collections::update_collection,
            commands::collections::delete_collection,
            commands::tags::list_tags,
            commands::tags::get_tag_tree,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            commands::bookmarks::list_all_bookmarks,
            commands::bookmarks::list_bookmarks_by_folder,
            commands::bookmarks::list_bookmarks_by_collection,
            commands::bookmarks::list_bookmarks_by_tag,
            commands::bookmarks::get_bookmark,
            commands::bookmarks::create_bookmark,
            commands::bookmarks::update_bookmark,
            commands::bookmarks::delete_bookmark,
            commands::bookmarks::search_bookmarks,
            commands::bookmarks::export_bookmarks,
            commands::notes::list_notes,
            commands::notes::create_note,
            commands::notes::update_note,
            commands::notes::delete_note,
            commands::metadata::fetch_metadata,
            commands::metadata::download_favicon,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
