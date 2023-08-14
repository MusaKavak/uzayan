#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_transfer;
mod main_stream;
mod progress;
mod stream;
mod udp;

extern crate json;
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            udp::listen_for_pair,
            main_stream::connect,
            main_stream::emit_message,
            file_transfer::receive::receive_files,
            file_transfer::send::send_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
