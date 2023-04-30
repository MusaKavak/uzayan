import { exists } from "@tauri-apps/api/fs"
import { appWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/api/dialog";
import { Public } from "./Public"
import { basename, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api";
import { Socket } from "../connection/Socket";
import { FileToDownload } from "../types/local/FileToTransfer";

export default class FileManager {


    async downloadFiles(files: Array<FileToDownload>, downloadLocation?: string) {
        const basePath = downloadLocation || await this.getDownloadFileLocation()
        if (!basePath) return

        const filesToReceive: ReceiveFileRequest[] = await Promise.all(files.map(async (f) => {
            const fileName = await basename(f.source)
            const target = await join(basePath, fileName)

            return {
                target,
                name: fileName,
                source: f.source,
                size: f.size
            }
        }))

        await invoke("receive_files", { address: Socket.connectedServer, filesToReceive })
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
    source: string,
    size: number,
}
