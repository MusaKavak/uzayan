#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file;
mod frontend;
mod tcp;
mod udp;

#[macro_use]
extern crate lazy_static;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            udp::listen_socket,
            tcp::connect,
            tcp::emit_message,
            tcp::get_ip_address,
            file::open_large_file_stream,
            file::receive_file,
            file::close_large_file_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
