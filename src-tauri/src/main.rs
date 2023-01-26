#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod socket;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![socket::init_socket])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
