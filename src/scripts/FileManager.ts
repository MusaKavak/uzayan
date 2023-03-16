import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import FileSvg from "../assets/file.svg";
import { Socket } from "../connection/Socket";
import { File } from "../types/File";
import { Public } from "./Public";

export default class FileManager {

    private filesTab = document.getElementById("files-tab-body")
    private svg = new FileSvg()

    createFiles(file: File) {
        if (this.filesTab) {
            this.filesTab.innerHTML = ""
            this.filesTab.appendChild(this.getHeader(file))
            this.filesTab.appendChild(this.getBody(file.children))
        }
    }


    private getBody(children: File[] | undefined): HTMLElement {
        return Public.createElement({
            id: "directory-body",
            children: children?.map(f => this.getRow(f))
        })
    }

    private getRow(f: File): HTMLElement {
        const callback = () => {
            if (f.isFile) this.addOrRemoveFromRequestList(f)
            else this.fileSystemRequest(f.path)
        }

        return Public.createElement({
            clss: "directory-row",
            innerHtml: `
                <span class="file-icon">${this.getFileIcon(f.isFile, f.extension)}</span>
                <span>${f.name || '-'}</span>
            `,
            listener: {
                event: "click",
                callback
            }
        })
    }

    private getHeader(file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header",
            clss: "card",
            children: [
                this.getGoBackButton(file.parent, file.isRoot),
                Public.createElement({
                    id: "directory-name",
                    content: file.name
                }),
                this.getFolderActions()
            ]
        })
    }

    private getFolderActions(): HTMLElement | undefined {

        return Public.createElement({
            content: "send",
            listener: {
                event: "click",
                callback: () => this.requestAllFilesFromList()
            }
        })
    }

    private getGoBackButton(parent: File | undefined, isRoot?: boolean): HTMLElement | undefined {
        if (parent != undefined && !isRoot) {
            const callback = () => this.fileSystemRequest(parent.path)

            return Public.createElement({
                id: "directory-goback",
                innerHtml: this.svg.goBack,
                title: parent.name,
                listener: {
                    event: "click",
                    callback
                }
            })
        } else return
    }

    private getFileIcon(isFile?: boolean, extension?: string): string {
        if (isFile) return `<span>${extension}</span>`
        else return `<span>${this.svg.folder}</span>`

    }

    private fileSystemRequest(path: string | undefined) {
        Socket.send("FileSystemRequest", { path })
    }


    private listOfFilesToRequest: File[] = []

    private addOrRemoveFromRequestList(f: File) {
        var allowToAdd = true;
        this.listOfFilesToRequest = this.listOfFilesToRequest.filter(file => {
            if (file == f) {
                allowToAdd = false
                return false
            }
            return true
        })
        if (allowToAdd) this.listOfFilesToRequest.push(f)
    }

    private async requestAllFilesFromList() {
        console.log(this.listOfFilesToRequest)
        const saveLocation = await Public.getDownloadFileLocation()
        if (saveLocation == undefined) return

        const isStreamOpen = await invoke("open_large_file_stream", { address: Socket.connectedServer })
        console.log(isStreamOpen)
        if (isStreamOpen) {
            var i = 0

            const unListen = await listen<boolean>("EndOfFile", (event) => {
                console.log(event)
                if (event.payload) {
                    i++
                    if (i == this.listOfFilesToRequest.length) {
                        unListen()
                        console.log("AllFilesReceived")
                        invoke("close_large_file_stream", { message: '{message:"CloseLargeFileStream"}\n' })
                    }
                    this.requestFileByIndex(i, saveLocation)
                }
            })

            this.requestFileByIndex(i, saveLocation)
        }
    }

    private async requestFileByIndex(i: number, saveLocation: string) {
        const f = this.listOfFilesToRequest[i]
        if (f == undefined) return
        const requestMessage = (JSON.stringify({ message: "FileRequest", input: { path: f.path } })) + "\n"

        await invoke("receive_file", {
            requestMessage,
            name: f.name,
            extension: f.extension,
            saveLocation
        })
    }
}
