use std::{
    ffi::OsStr,
    io::Write,
    process::{Child, Command, Stdio},
    sync::Mutex,
};

use tauri::{command, Window};

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

#[command]
pub fn start_screencast(window: Window, command: String) {
    let progress: Mutex<Child> = Mutex::new(
        Command::new("cmd")
            .arg("/C")
            .arg(command)
            .stdin(Stdio::piped())
            .spawn()
            .unwrap(),
    );

    window.clone().listen("stop_screencast", move |event| {
        let mut progress = progress.lock().unwrap();
        progress.stdin.take().unwrap().write_all(b"q").unwrap();
        progress.wait().unwrap();
        progress.kill().unwrap();
        window.unlisten(event.id());
    });
}
