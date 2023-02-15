import { Socket } from "./connection/Socket";
import { MediaSessionManager } from "./scripts/MediaSessionManager";
import NotificationManager from "./scripts/NotificationManager";
import { OptionsManager } from "./scripts/OptionsManager";
import { Public } from "./scripts/Public";
import { WindowLayoutManager } from "./scripts/WindowLayoutManager";

var socket: Socket | undefined

function socketcallback(message: string, input: any, address: string) {
    socket?.send(message, input, address)
}

async function Main() {
    Public.getSettingsFromLocalStorage()
    const optionsManager = new OptionsManager(socketcallback)
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager(socketcallback)
    const notificationManager = new NotificationManager(windowLayoutManager)
    socket = new Socket(mediaSessionManager, notificationManager)
    optionsManager.sync()
}


window.onload = Main;
