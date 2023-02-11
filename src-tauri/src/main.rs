#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod socket;

#[macro_use]
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            socket::listen_socket,
            socket::send_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
