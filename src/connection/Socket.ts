import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { UdpSocketListenerCallbacks } from '../types/Callbacks'
import { AndroidType } from '../types/AndroidTypes'

export class Socket {

    constructor(private callbacks: UdpSocketListenerCallbacks) { }

    async inititialize() {
        invoke("listen_socket")
        await listen<string>('udp', (event) => {
            const { message, emitObject } = JSON.parse(event.payload) as EmitObject
            switch (message) {
                case "MediaSessions": { this.callbacks.mediaSessions(emitObject as []) }
                case "SingleMediaSession": { this.callbacks.singleMediaSession(emitObject) }
                default: break;
            }
        })
    }
}

type EmitObject = {
    message: String,
    emitObject: AndroidType
}

// use tauri::{event::{Event, WINDOW_EVENT_RESUMED}, Tauri};

// fn main() {
//     Tauri::builder()
//         .build()
//         .run(|webview, _| {
//             webview.set_listener(|_webview, event| {
//                 match event {
//                     Event::WindowEvent { event, .. } => match event {
//                         WINDOW_EVENT_RESUMED => {
//                             println!("PC woke up from sleep");
//                             // Run the function after the PC wakes up from sleep
//                         },
//                         _ => {}
//                     },
//                     _ => {}
//                 }
//             });
//         });
// }
