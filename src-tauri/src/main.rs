#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod socket;
mod tcp;
mod tools;

#[macro_use]
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            socket::listen_socket,
            socket::send_message,
            tcp::connect,
            tcp::emit_message,
            tcp::listen_for_connections,
            tools::get_ip_address
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
