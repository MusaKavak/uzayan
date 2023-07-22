#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_in;
mod file_out;
mod progress;
mod tcp;
mod udp;

extern crate json;
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            udp::listen_for_pair,
            tcp::connect,
            tcp::emit_message,
            file_in::receive_files,
            file_out::send_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
