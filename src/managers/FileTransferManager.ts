import { appWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/api/dialog";
import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";
import Public from "../utils/Public";
import { exists } from "@tauri-apps/api/fs";
import ConnectionState from "../connection/ConnectionState";

export default class FileTransferManager {

    async downloadFiles(files: Array<{ target: string, source: string }>, transferType: TransferType, downloadLocation?: string) {
        const basePath = downloadLocation || await this.getDownloadFileLocation()
        if (!basePath) return

        const filesToReceive: ReceiveFileRequest[] = await Promise.all(files.map(async (f) => {
            const target = await join(basePath, f.name)

            return {
                target,
                name: f.name,
                id: f.id,
                size: f.size
            }
        }))
        console.log(filesToReceive[0])
        if (ConnectionState.connectedAddress)
            await invoke("receive_files", {
                address: ConnectionState.connectedAddress,
                transferType,
                filesToReceive
            })
    }

    async getDownloadFileLocation(): Promise<string | undefined> {
        const path = Public.settings.DownloadLocation.DonwloadFileLocation
        const remember = Public.settings.DownloadLocation.RememberDownloadLocation
        if (path != undefined && remember && await exists(path)) return path

        const pathOptions = {
            directory: true,
            multiple: false,
            title: "Select Download Location",
        }

        await appWindow.setAlwaysOnTop(false)
        const newPath = await open(pathOptions)
        await appWindow.setAlwaysOnTop(true)

        if (newPath != null && !Array.isArray(newPath)) return newPath
        return
    }
}