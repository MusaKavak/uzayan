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
import FileTransfer from "./utils/FileTransfer";
import { getAppSettings, loadAppearanceSettings } from "./utils/Settings";
import DialogManager from "./managers/DialogManager";
import Public from "./utils/Public";

async function Main() {
    //document.addEventListener('contextmenu', event => event.preventDefault());

    Public.settings = await getAppSettings()
    await loadAppearanceSettings(Public.settings)

    const dialogManager = new DialogManager()
    const headerManager = new HeaderManager()
    const windowManager = new WindowManager(document.body)
    const mediaSessionManager = new MediaSessionManager()
    const notificationManager = new NotificationManager(windowManager)
    const fileTransfer = new FileTransfer()
    const fileManager = new FileManager(fileTransfer, dialogManager)
    const imageManager = new ImageManager(fileTransfer)
    const connectionState = new ConnectionState(headerManager)
    new IOProgressManager()
    new TabsManager(fileManager)
    new Socket(connectionState, mediaSessionManager, notificationManager, imageManager, fileManager)
}


window.onload = Main;
