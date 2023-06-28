import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import MediaSessionManager from '../managers/MediaSessionManager'
import { NetworkMessage } from '../types/network/NetworkMessage'
import NotificationManager from '../managers/NotificationManager'
import ImageManager from '../managers/ImageManager'
import FileManager from '../managers/FileManager'
import { BackendMessage } from '../types/local/BackendMessage'

export default class Socket {

    constructor(
        private mediaSessionManager: MediaSessionManager,
        private notificationManger: NotificationManager,
        private imageManager: ImageManager,
        private fileManager: FileManager
    ) { this.inititialize() }

    private async inititialize() {
        await listen<BackendMessage>('TcpMessage', (event) => {
            const json = JSON.parse(event.payload.message)
            this.call(json)

        })
    }

    private async call(message: NetworkMessage<any>) {
        switch (message.event) {
            case "MediaSessions": { this.mediaSessionManager.createMediaSessions(message.payload as []); break }
            case "MediaSessionState": { this.mediaSessionManager.updateMediaSessionState(message.payload); break }
            case "SingleMediaSession": { this.mediaSessionManager.updateMediaSession(message.payload); break }
            case "Notification": { this.notificationManger.createNotification(message.payload, true); break }
            case "RemoveNotification": { this.notificationManger.removeNotification(message.payload); break }
            case "Notifications": { this.notificationManger.syncNotifications(message.payload); break }
            case "ImageThumbnail": { this.imageManager.setThumbnail(message.payload); break }
            case "FileSystem": { this.fileManager.createFiles(message.payload); break }
            default: break;
        }
    }

    static async send(event: string, input: any) {
        const message = (JSON.stringify({ message: event, input })) + "\n"
        console.log(".")
        await invoke("emit_message", { message })
    }
}