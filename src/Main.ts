import { Socket } from "./connection/Socket";
import { ConnectionState } from "./connection/ConnectionState";
import MediaSessionManager from "./scripts/MediaSessionManager";
import NotificationManager from "./scripts/NotificationManager";
import OptionsManager from "./scripts/OptionsManager";
import { Public } from "./scripts/Public";
import WindowLayoutManager from "./scripts/WindowLayoutManager";
import TabsManager from "./scripts/TabsManager";
import ImageManager from "./scripts/ImageManager";
import FileManager from "./scripts/FileManager";

async function Main() {
    Public.getSettingsFromLocalStorage()
    const optionsManager = new OptionsManager()
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowLayoutManager)
    new TabsManager()
    const fileManager = new FileManager()
    const imageManager = new ImageManager()
    const connectionState = new ConnectionState(optionsManager)
    new Socket(connectionState, mediaSessionManager, notificationManager, imageManager, fileManager)
}


window.onload = Main;
