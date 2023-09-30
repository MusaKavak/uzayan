use std::{ffi::OsStr, process::Command};

use tauri::command;

#[command]
pub fn get_device_name() -> String {
    whoami::devicename()
}

#[command]
pub fn run_command(os: String, command: String) {
    std::thread::spawn(move || {
        let (program, arg0) = match os.as_str() {
            "Linux" => ("sh", "-c"),
            "Windows_NT" => ("cmd", "/C"),
            _ => panic!("Unsupported OS"),
        };

        let command = OsStr::new(&command);

        match Command::new(program).arg(arg0).arg(command).output() {
            Ok(out) => String::from_utf8(out.stdout).unwrap(),
            Err(_) => "***ERROR***".to_string(),
        }
    });
}
