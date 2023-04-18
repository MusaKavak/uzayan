#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file;
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
            file::open_large_file_stream,
            file::request_file,
            file::close_large_file_stream,
            file::get_current_progress,
            file_out::send_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
