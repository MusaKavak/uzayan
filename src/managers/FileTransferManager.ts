import { appWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/api/dialog";
import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";
import Public from "../utils/Public";
import { exists } from "@tauri-apps/api/fs";
import ConnectionState from "../connection/ConnectionState";

export default class FileTransferManager {

    async receiveFiles(files: { sourcePath: string, fileName: string }[]) {
        const basePath = await this.getDownloadFileLocation()
        if (!basePath) return

        const filesToReceive = await Promise.all(files.map(async (f) => {
            const target = await join(basePath, f.fileName)

            return { source: f.sourcePath, target }
        }))

        if (ConnectionState.connectedAddress)
            invoke(
                "receive_files", {
                address: ConnectionState.connectedAddress,
                secure: ConnectionState.isConnectionSecure,
                files: filesToReceive
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