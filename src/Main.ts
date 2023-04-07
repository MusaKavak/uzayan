import { Socket } from "./connection/Socket";
import { ConnectionState } from "./connection/ConnectionState";
import MediaSessionManager from "./scripts/MediaSessionManager";
import NotificationManager from "./scripts/NotificationManager";
import OptionsManager from "./scripts/OptionsManager";
import WindowLayoutManager from "./scripts/WindowLayoutManager";
import TabsManager from "./scripts/TabsManager";
import ImageManager from "./scripts/ImageManager";
import FileTabManager from "./scripts/FileTabManager";
import IOManager from "./scripts/IOManager";
import FileManager from "./scripts/FileManager";
import { loadSettings } from "./scripts/Settings";

async function Main() {
    //document.addEventListener('contextmenu', event => event.preventDefault());
    await loadSettings()
    const optionsManager = new OptionsManager()
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowLayoutManager)
    new TabsManager()
    const ioManager = new IOManager()
    const fileManager = new FileManager(ioManager)
    const fileTabManager = new FileTabManager(fileManager)
    const imageManager = new ImageManager(fileManager)
    const connectionState = new ConnectionState(optionsManager)
    new Socket(connectionState, mediaSessionManager, notificationManager, imageManager, fileTabManager)
}


window.onload = Main;
