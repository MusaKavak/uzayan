#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod file_in;
mod file_out;
mod frontend;
mod progress;
mod tcp;
mod tools;
mod udp;

#[macro_use]
extern crate lazy_static;
extern crate json;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            tools::get_ip_address,
            tools::get_hostname,
            udp::listen_socket,
            tcp::connect,
            tcp::emit_message,
            file_in::receive_files,
            file_out::send_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
