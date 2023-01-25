#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::thread;

mod udp_socket;

fn main() {
    // thread::spawn(|| udp_socket::init_socket());
    udp_socket::init_socket();
    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");
}
