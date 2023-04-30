import { Socket } from "./connection/Socket";
import { ConnectionState } from "./connection/ConnectionState";
import MediaSessionManager from "./scripts/MediaSessionManager";
import NotificationManager from "./scripts/NotificationManager";
import HeaderManager from "./scripts/HeaderManager";
import WindowLayoutManager from "./scripts/WindowLayoutManager";
import TabsManager from "./scripts/TabsManager";
import ImageManager from "./scripts/ImageManager";
import FileTabManager from "./scripts/FileTabManager";
import IOManager from "./scripts/IOManager";
import FileManager from "./scripts/FileTransferManager";
import { loadSettings } from "./scripts/Settings";
import { DialogManager } from "./scripts/DialogManager";

async function Main() {
    //document.addEventListener('contextmenu', event => event.preventDefault());
    await loadSettings()
    const dialogManager = new DialogManager()
    const headerManager = new HeaderManager()
    const windowLayoutManager = new WindowLayoutManager(document.body)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowLayoutManager)
    const ioManager = new IOManager()
    const fileTransferManager = new FileManager(ioManager)
    const fileTabManager = new FileTabManager(fileTransferManager, dialogManager)
    const imageManager = new ImageManager(fileTransferManager)
    const connectionState = new ConnectionState(headerManager)
    new TabsManager(fileTabManager)
    new Socket(connectionState, mediaSessionManager, notificationManager, imageManager, fileTabManager)
}


window.onload = Main;
