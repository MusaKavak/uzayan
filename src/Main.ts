import { Socket } from "./connection/Socket";
import { ConnectionState } from "./connection/ConnectionState";
import { MediaSessionManager } from "./scripts/MediaSessionManager";
import NotificationManager from "./scripts/NotificationManager";
import { OptionsManager } from "./scripts/OptionsManager";
import { Public } from "./scripts/Public";
import { WindowLayoutManager } from "./scripts/WindowLayoutManager";

async function Main() {
    Public.getSettingsFromLocalStorage()
    const optionsManager = new OptionsManager()
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowLayoutManager)
    const connectionState = new ConnectionState()
    new Socket(connectionState, mediaSessionManager, notificationManager)
    optionsManager.sync()
}


window.onload = Main;
