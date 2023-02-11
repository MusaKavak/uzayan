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
    const mediaSessionManager = new MediaSessionManager()
    socket = new Socket(mediaSessionManager)
}

window.onload = Main;
