import { Socket } from "./connection/Socket";
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
    new Socket(mediaSessionManager, notificationManager)
    optionsManager.sync()
}


window.onload = Main;
