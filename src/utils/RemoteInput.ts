import { invoke } from "@tauri-apps/api";

export async function mouseClick(left: boolean) {
    await invoke("mouse_click", { left })
}

export async function mouseMove(payload: { x: number, y: number }) {
    await invoke("mouse_move", payload)
}