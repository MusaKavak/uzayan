import { exists } from "@tauri-apps/api/fs"
import { appWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/api/dialog";
import Public from "../utils/Public"
import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";
import Socket from "../connection/Socket";
import { FileToDownload } from "../types/local/FileToTransfer";

export default class FileTransfer {

    async downloadFiles(files: Array<FileToDownload>, transferType: TransferType, downloadLocation?: string) {
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
        await invoke("receive_files", { address: Socket.connectedServer, transferType, filesToReceive })
    }

    async getDownloadFileLocation(): Promise<string | undefined> {
        const path = Public.settings.DonwloadFileLocation
        const remember = Public.settings.RememberDownloadLocation
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

type ReceiveFileRequest = {
    target: string,
    name: string
    id: string,
    size: number,
}

type TransferType = "FileTransfer" | "ImageTransfer"