import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import MediaSessionManager from '../scripts/MediaSessionManager'
import { ConnectionObject } from '../types/ConnectionObject'
import NotificationManager from '../scripts/NotificationManager'
import { ConnectionState } from './ConnectionState'
import ImageManager from '../scripts/ImageManager'

export class Socket {

    constructor(
        private connectionState: ConnectionState,
        private mediaSessionManager: MediaSessionManager,
        private notificationManger: NotificationManager,
        private imageManager: ImageManager
    ) { this.inititialize() }

    private async inititialize() {
        await listen<string>("SocketPort", (payload) => {
            console.log(payload)
            this.connectionState.showQrCode(payload.payload)
        })
        invoke("listen_for_connections")

        await listen<Payload>('TcpMessage', (event) => {
            const json = JSON.parse(event.payload.input)
            this.call(json, event.payload.address)
        })
    }

    private async call(message: ConnectionObject, address: string) {
        switch (message.message) {
            case "TestConnection": { this.connectionState.testTheConnection(address); break }
            case "Pair": { this.connectionState.pair(address, message.input); break }
            case "MediaSessions": { this.mediaSessionManager.createMediaSessions(message.input as []); break }
            case "MediaSessionState": { this.mediaSessionManager.updateMediaSessionState(message.input); break }
            case "SingleMediaSession": { this.mediaSessionManager.updateMediaSession(message.input); break }
            case "Notification": { this.notificationManger.pushNotification(message.input); break }
            case "RemoveNotification": { this.notificationManger.removeNotification(message.input); break }
            case "Notifications": { this.notificationManger.syncNotifications(message.input); break }
            case "ImageThumbnail": { this.imageManager.setThumbnail(message.input); break }
            default: break;
        }
    }

    static async send(event: string, input: any) {
        const message = JSON.stringify({ message: event, input })
        console.log(".")
        await invoke("emit_message", { message })
    }

    static async connect(address: string, port: string) {
        await invoke("connect", { address: `${address}:${port}` })
    }
}

type Payload = {
    input: string,
    address: string
}
