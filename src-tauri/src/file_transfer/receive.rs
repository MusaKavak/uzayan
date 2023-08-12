use std::thread;

use tauri::{command, Window};

use super::FileTransferObject;

#[derive(Clone, serde::Serialize)]

struct UpdateProgressRequest {
    progress_id: u8,
    ratio: f32,
}

#[command]
pub fn receive_files(
    window: Window,
    address: String,
    isSecure: bool,
    files_to_receive: Vec<FileTransferObject>,
) {
}
