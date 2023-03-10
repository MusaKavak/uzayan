import { exists } from "@tauri-apps/api/fs";
import { open, OpenDialogOptions } from "@tauri-apps/api/dialog";
import { Public } from "./Public";
import { appWindow } from "@tauri-apps/api/window";

export default class FileManager {

    async getDownloadFileLocation(): Promise<String | undefined> {
        const path = Public.settings.DonwloadFileLocation
        const remember = Public.settings.RememberDownloadLocation
        if (path != undefined && remember && await exists(path)) return path

        const pathOptions: OpenDialogOptions = {
            directory: true,
            multiple: false,
            title: "Select Download Location",
        }

        await appWindow.setAlwaysOnTop(false)
        const newPath = await open(pathOptions)
        await appWindow.setAlwaysOnTop(true)

        if (newPath != null && !Array.isArray(newPath)) {
            if (remember) {
                Public.settings.DonwloadFileLocation = newPath
                Public.updateSettings()
            }
            return newPath
        }
        return
    }

}