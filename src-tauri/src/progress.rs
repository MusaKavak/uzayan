use std::sync::atomic::AtomicU8;
use std::sync::atomic::Ordering::Relaxed;

use tauri::Window;

#[derive(serde::Serialize, Clone)]
pub struct ProgressRequest {
    id: u8,
    is_input: bool,
}

#[derive(serde::Serialize, Clone)]
pub struct ProgressUpdate {
    id: u8,
    pub name: String,
    pub progress: f32,
    pub ratio: String,
}

static ID: AtomicU8 = AtomicU8::new(0);

pub fn send_progress_bar_request(window: &Window, is_input: bool) -> ProgressUpdate {
    let id = ID.fetch_add(1, Relaxed);

    window
        .emit("progress_bar_request", ProgressRequest { id, is_input })
        .unwrap();

    return ProgressUpdate {
        id,
        name: String::new(),
        progress: 0.0,
        ratio: String::new(),
    };
}
