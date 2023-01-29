import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'

export class Socket {
    async inititialize() {
        // invoke("init_socket")

        await listen('udp', (event) => {
            console.log(event)
        })
    }
}