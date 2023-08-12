import Socket from "./connection/Socket";
import ConnectionState from "./connection/ConnectionState";
import MediaSessionManager from "./managers/MediaSessionManager";
import NotificationManager from "./managers/NotificationManager";
import HeaderManager from "./managers/HeaderManager";
import WindowManager from "./managers/WindowManager";
import TabsManager from "./managers/TabsManager";
import ImageManager from "./managers/ImageManager";
import FileManager from "./managers/FileManager";
import IOProgressManager from "./managers/IOProgressManager";
import FileTransferManager from "./managers/FileTransferManager";
import { getAppSettings, loadAppearanceSettings } from "./utils/Settings";
import DialogManager from "./managers/DialogManager";
import Public from "./utils/Public";

async function Main() {
    //document.addEventListener('contextmenu', event => event.preventDefault());

    Public.settings = await getAppSettings()
    await loadAppearanceSettings(Public.settings)

    const dialogManager = new DialogManager()
    const headerManager = new HeaderManager()
    const windowManager = new WindowManager(document.getElementById("body")!!)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowManager)
    const fileTransferManager = new FileTransferManager()
    const fileManager = new FileManager(fileTransferManager, dialogManager)
    const imageManager = new ImageManager(fileTransferManager)
    new ConnectionState(headerManager, dialogManager)
    new IOProgressManager()
    new TabsManager(fileManager)
    new Socket(mediaSessionManager, notificationManager, imageManager, fileManager)
}


window.onload = Main;
