use std::sync::Mutex;

use enigo::{Enigo, MouseButton, MouseControllable};
use tauri::{command, State};

pub struct EnigoState {
    pub enigo: Mutex<Enigo>,
}

impl Default for EnigoState {
    fn default() -> Self {
        Self {
            enigo: Mutex::new(Enigo::new()),
        }
    }
}

#[command]
pub fn mouse_move(x: i32, y: i32, enigo_state: State<EnigoState>) {
    enigo_state.enigo.lock().unwrap().mouse_move_to(x, y);
}

#[command]
pub fn mouse_click(left: bool, enigo_state: State<EnigoState>) {
    enigo_state.enigo.lock().unwrap().mouse_click(if left {
        MouseButton::Left
    } else {
        MouseButton::Right
    });
}
