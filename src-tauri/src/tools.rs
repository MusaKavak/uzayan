use std::{ffi::OsStr, process::Command};

use tauri::command;

#[command]
pub fn get_device_name() -> String {
    whoami::devicename()
}

#[command]
pub fn run_command(command: String) {
    std::thread::spawn(move || {
        let command = OsStr::new(&command);

        match Command::new("sh").arg("-c").arg(command).output() {
            Ok(out) => {
                println!("Command Output: {}", String::from_utf8(out.stdout).unwrap());
            }
            Err(e) => {
                println!("Command failed with an error: {}", e.to_string());
            }
        }
    });
}

#[command]
pub fn run_command_and_return(command: String) -> String {
    match Command::new("sh").arg("-c").arg(command).output() {
        Ok(out) => String::from_utf8(out.stdout).unwrap(),
        Err(_) => "***ERROR***".to_string(),
    }
}
