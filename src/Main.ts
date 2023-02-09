import { Socket } from "./connection/Socket";
import { MediaSessionManager } from "./scripts/MediasSessionManager";
import { Public } from "./scripts/Public";
import { WindowLayoutManager } from "./scripts/WindowLayoutManager";
import { AndroidMediaSession } from "./types/AndroidTypes";
import { UdpSocketListenerCallbacks, WindowLayoutCallbacks } from "./types/Callbacks";

var socket: Socket | undefined
var windowLayoutManager: WindowLayoutManager | undefined
var mediaSessionManager: MediaSessionManager | undefined

async function Main() {
    Public.getSettingsFromLocalStorage()
    windowLayoutManager = new WindowLayoutManager(windowLayoutCallbacks, document.body)
    windowLayoutManager.setWindowOnStartup()
    socket = new Socket(udpSocketCallbacks)
    socket.inititialize()
    mediaSessionManager = new MediaSessionManager()
}

const udpSocketCallbacks: UdpSocketListenerCallbacks = {
    mediaSessions: function (sessions: AndroidMediaSession[]): void {
        mediaSessionManager?.createMediaSessions(sessions)
    },
    singleMediaSession: function (session: AndroidMediaSession): void {
        mediaSessionManager?.updateMediaSession(session)
    }
}

const windowLayoutCallbacks: WindowLayoutCallbacks = {
    windowOpened: function () {

    },
    windowClosed: function () {

    }
}

window.onload = Main;
