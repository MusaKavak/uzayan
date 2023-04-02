import { invoke } from "@tauri-apps/api"
import { listen } from "@tauri-apps/api/event"
import { exists } from "@tauri-apps/api/fs"
import { appWindow } from "@tauri-apps/api/window"
import { open } from "@tauri-apps/api/dialog";
import { Socket } from "../connection/Socket"
import { File } from "../types/File"
import { FileRequest } from "../types/FileRequest"
import { Public } from "./Public"
import IOManager from "./IOManager";

export default class FileManager {

    constructor(private ioManager: IOManager) { }

    async requestFiles(files: File[]) {
        const location = await this.getDownloadFileLocation()
        if (location == undefined) return
        const filesToRequest = files.map(f => {
            const requestMessage = (JSON.stringify({ message: "FileRequest", input: { path: f.path } })) + "\n"
            return {
                extension: f.extension,
                size: f.size,
                name: f.name,
                message: requestMessage,
                location
            } as FileRequest
        })
        this.request(filesToRequest, location)
    }

    private async request(files: FileRequest[], saveLocation: string) {
        const isStreamOpen = await invoke("open_large_file_stream", { address: Socket.connectedServer })
        if (isStreamOpen) {
            this.ioManager.createNewInputProgressBar(files.length, files[0].name, saveLocation, "")

            var i = 0

            const unListen = await listen<boolean>("EndOfFile", async (event) => {
                if (event.payload) {
                    i++
                    if (i == files.length) {
                        unListen()
                        console.log("AllFilesReceived")
                        invoke("close_large_file_stream", { message: '{message:"CloseLargeFileStream"}\n' })
                        return
                    }
                    const nextFile = files[i]
                    this.ioManager.nextFile(
                        `${i + 1}/${files.length}`,
                        nextFile.name
                    )
                    await invoke("request_file", {
                        request: nextFile
                    })
                }
            })
            await invoke("request_file", {
                request: files[i]
            })
        }
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

