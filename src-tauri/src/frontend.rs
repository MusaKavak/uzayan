use tauri::Window;

#[derive(Clone, serde::Serialize)]
pub struct Payload {
    input: String,
    address: String,
}

static mut WINDOW: Option<Window> = None;

pub unsafe fn set_window(window: Window) {
    WINDOW = Some(window)
}

pub unsafe fn emit(event: &str, payload_input: String, payload_address: String) {
    match &WINDOW {
        Some(window) => window
            .emit(
                event,
                Payload {
                    input: payload_input,
                    address: payload_address,
                },
            )
            .unwrap(),
        None => {
            println!("Emitter Not Set");
        }
    };
}
