#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_in;
mod file_out;
mod frontend;
mod tcp;
mod udp;

#[macro_use]
extern crate lazy_static;
extern crate json;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            udp::listen_socket,
            tcp::connect,
            tcp::emit_message,
            tcp::get_ip_address,
            file_in::receive_files,
            file_out::send_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
