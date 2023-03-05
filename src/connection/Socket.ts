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

    private pendingPackets: { [key: string]: string } = {}

    private async inititialize() {
        invoke("listen_for_connections")
        invoke("connect", { address: "192.168.1.101:34724" })

        setInterval(() => {
            invoke("emit_message", { message: "Hellooo\n" })
        }, 5000);


        // invoke("listen_socket")
        // await listen<UdpSocketMessage>('UdpMessage', (event) => {
        //     const p = event.payload
        //     this.pendingPackets[p.header.packet_id] = (this.pendingPackets[p.header.packet_id] || "") + event.payload.body
        //     if (p.header.count_of_chunks == p.header.current_chunk) {
        //         const message = JSON.parse(this.pendingPackets[p.header.packet_id]) as ConnectionObject
        //         this.pendingPackets[p.header.packet_id] = ""
        //         this.call(message, event.payload.address)
        //     }
        // })
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

    static async send(message: string, input: any, address: string = "192.168.1.101:34724") {
        const data = JSON.stringify({ message, input })
        console.log("w")
        invoke("send_message", { data, address })
    }
}

type UdpSocketMessage = {
    header: {
        packet_id: string,
        count_of_chunks: string,
        current_chunk: string
    },
    body: string,
    address: string
}