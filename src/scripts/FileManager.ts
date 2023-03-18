import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import FileSvg from "../assets/file.svg";
import { Socket } from "../connection/Socket";
import { File } from "../types/File";
import { Public } from "./Public";

export default class FileManager {

    private filesTab = document.getElementById("files-tab-body")
    private svg = new FileSvg()
    private allowToCreate = true

    constructor() {
        this.filesTab?.classList.toggle("select")
    }

    createFiles(file: File) {
        if (this.filesTab && this.allowToCreate) {
            this.filesTab.innerHTML = ""
            this.filesTab.appendChild(this.getHeader(file))
            this.filesTab.appendChild(this.getBody(file.children))
            this.allowToCreate = false
        }
    }


    private getBody(children: File[] | undefined): HTMLElement {
        return Public.createElement({
            id: "directory-body",
            children: children?.map(f => this.getDirectoryItem(f))
        })
    }

    private getDirectoryItem(f: File): HTMLElement {
        const callback = () => {
            if (f.isFile) {
                //this.addOrRemoveFromRequestList(f)
            }
            else this.fileSystemRequest(f.path)
        }

        return Public.createElement({
            type: "label",
            clss: "directory-row " + (f.isFile ? "file" : ""),
            innerHtml: `
                <span class="file-icon">${this.getFileIcon(f.isFile, f.extension)}</span>
                <span>${f.name || '-'}</span>
            `,
            children: [
                this.getSelectionCheckBox(f)
            ],
            listener: {
                event: "click",
                callback
            }
        })
    }

    getSelectionCheckBox(f: File): HTMLElement | undefined {
        if (f.isFile) {
            const chbx = document.createElement("input") as HTMLInputElement
            chbx.classList.add("selection-checkbox")
            chbx.setAttribute("type", "checkbox")
            chbx.setAttribute("style", "opacity: 0;")
            chbx.addEventListener("change", () => {
                if (chbx.checked) {
                    this.addToRequestList(f)
                } else {
                    this.removeFromRequestList(f)
                }
                console.log(this.filesToRequest)
            })
            return chbx
        }
        return
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
                this.getDirectoryActions()
            ]
        })
    }

    private getDirectoryActions(): HTMLElement | undefined {
        return Public.createElement({
            id: "directory-actions",
            children: [
                Public.createElement({
                    innerHtml: this.svg.select,
                    title: "Select",
                    listener: {
                        event: "click",
                        callback: () => this.filesTab?.classList.toggle("select")
                    }
                })
            ]
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
        this.allowToCreate = true
        Socket.send("FileSystemRequest", { path })
    }


    private filesToRequest: File[] = []

    private addToRequestList(f: File) {
        if (!this.filesToRequest.includes(f)) {
            this.filesToRequest.push(f)
        }
    }
    private removeFromRequestList(f: File) {
        this.filesToRequest = this.filesToRequest.filter(file => file != f)
    }

    private async requestAllFilesFromList() {
        console.log(this.filesToRequest)
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
                    if (i == this.filesToRequest.length) {
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
        const f = this.filesToRequest[i]
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
