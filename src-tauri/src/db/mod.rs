pub mod init;
pub mod models;

use rusqlite::Connection;
use std::sync::Mutex;

pub type DbState = Mutex<Connection>;
