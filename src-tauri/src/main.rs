#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod tcp;
mod tools;
mod udp;

#[macro_use]
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            udp::listen_socket,
            tcp::connect,
            tcp::emit_message,
            tcp::connect_for_large_file_transaction,
            tools::get_ip_address
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
