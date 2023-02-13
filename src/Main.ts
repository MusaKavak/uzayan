import { Socket } from "./connection/Socket";
import { MediaSessionManager } from "./scripts/MediaSessionManager";
import { Public } from "./scripts/Public";
import { WindowLayoutManager } from "./scripts/WindowLayoutManager";

var socket: Socket | undefined

function socketcallback(message: string, input: any, address: string) {
    socket?.send(message, input, address)
}

async function Main() {
    Public.getSettingsFromLocalStorage()
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager(socketcallback)
    socket = new Socket(mediaSessionManager)
    sync()
}

function sync() {
    socketcallback("MediaSessionsRequest", "", "192.168.1.105:34724")
}

window.onload = Main;
