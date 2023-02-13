import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import { MediaSessionManager } from '../scripts/MediaSessionManager'
import { ConnectionObject } from '../types/ConnectionObject'

export class Socket {

    constructor(
        private mediaSessionManager: MediaSessionManager
    ) { this.inititialize() }

    private async inititialize() {
        invoke("listen_socket")
        await listen<string>('udp', (event) => {
            const message = JSON.parse(event.payload) as ConnectionObject
            this.call(message)
        })
    }

    private async call(message: ConnectionObject) {
        switch (message.message) {
            case "MediaSessions": this.mediaSessionManager.createMediaSessions(message.input as [])
            case "SingleMediaSession": this.mediaSessionManager.updateMediaSession(message.input)
            default: break;
        }
    }

    async send(message: string, input: any, address: string) {
        const data = JSON.stringify({ message, input })
        console.log("w")
        invoke("send_message", { data, address })
    }
}

