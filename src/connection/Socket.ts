import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { type } from 'os'

export class Socket {
    async inititialize() {
        invoke("init_socket")
        await listen<string>('udp', (event) => {
            console.log(JSON.parse(event.payload))
        })
    }
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