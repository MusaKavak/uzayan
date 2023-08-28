use tauri::command;

#[command]
pub fn get_device_name() -> String {
    whoami::devicename()
}
