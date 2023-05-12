import { basename, extname, join } from "@tauri-apps/api/path";
import FileSvg from "../assets/file.svg";
import Socket from "../connection/Socket";
import { File } from "../types/network/File";
import DialogManager from "./DialogManager";
import FileTransfer from "../utils/FileTransfer";
import Public from "../utils/Public";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import { FileToDownload } from "../types/local/FileToTransfer";

export default class FileManager {

    private filesTab = document.getElementById("files-tab-body")
    private svg = new FileSvg()
    private allowToCreate = true
    private isSelectionOpen = false
    private currentPath?: string

    unlistenDropListener: UnlistenFn = () => { }

    constructor(
        private fileManager: FileTransfer,
        private dialogManager: DialogManager) {
        this.filesTab?.classList.toggle("select")
    }

    createFiles(file: File) {
        if (this.filesTab && this.allowToCreate) {
            this.filesTab.innerHTML = ""
            this.filesTab.appendChild(this.getHeader(file))
            this.filesTab.appendChild(this.getBody(file.children))
            this.allowToCreate = false
            this.currentPath = file.path
            this.filesToRequest = []
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
            clss: "directory-item card " + (f.isFile ? "file" : ""),
            innerHtml: `
                <span class="file-icon">${this.getFileIcon(f.isFile, f.extension)}</span>
                <span>${f.name || '-'}</span>
            `,
            children: [
                this.getSelectionCheckBox(f),
                this.getMenu(f),
            ],
            listener: {
                event: "click",
                callback
            }
        })
    }

    private getMenu(f: File): HTMLElement | undefined {
        if (!f.isFile) return
        const menu = Public.createElement({
            clss: "directory-item-menu",
            children: [
                this.getDeleteButton(f.path),
                this.getRenameButton(f),
                this.getDownloadButton(f)
            ]
        })
        menu.setAttribute("tabIndex", "-1")
        return menu
    }

    private getDownloadButton(f: File): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Download",
            listener: {
                event: "click",
                callback: () => {
                    this.fileManager.downloadFiles([{ id: f.path, size: f.size, name: f.name }], "FileTransfer")
                }
            }
        })
    }

    private getRenameButton(f: File): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Rename",
            listener: {
                event: "click",
                callback: () => {
                    this.dialogManager.showDialogWithInput(
                        "Rename File",
                        f.name || "",
                        async (value?: string) => {
                            if (this.currentPath && value) {
                                this.allowToCreate = true
                                const source = f.path
                                const target = await join(this.currentPath, value)
                                Socket.send("MoveFileRequest", { source, target })
                            }
                        }
                    )
                }
            }
        })
    }

    private getDeleteButton(path?: string): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Delete",
            listener: {
                event: "click",
                callback: () => {
                    this.dialogManager.showDialog(
                        "Are you sure you want to delete this file?",
                        () => {
                            this.allowToCreate = true
                            Socket.send("DeleteFileRequest", { path })
                        }
                    )
                }
            }
        })
    }

    private getSelectionCheckBox(f: File): HTMLElement | undefined {
        if (!f.isFile) return
        const chbx = document.createElement("input") as HTMLInputElement
        chbx.classList.add("selection-checkbox")
        chbx.setAttribute("type", "checkbox")
        chbx.setAttribute("style", "opacity: 0;")
        chbx.addEventListener("change", () => {
            if (!this.isSelectionOpen) {
                chbx.checked = !chbx.checked
            } else {
                if (chbx.checked) {
                    this.addToRequestList(f)
                } else {
                    this.removeFromRequestList(f)
                }
            }
        })
        return chbx
    }

    private getHeader(file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header",
            clss: "card",
            children: [
                this.getHeaderTitle(file),
                this.getDropMessage(),
                this.getDirectoryActions()
            ]
        })
    }

    private getHeaderTitle(file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header-title",
            children: [
                this.getGoBackButton(file.parent, file.isRoot),
                Public.createElement({
                    id: "directory-name",
                    title: file.name,
                    content: file.name
                }),
            ]
        })
    }

    private getDropMessage(): HTMLElement {
        return Public.createElement({
            id: "directory-drop",
            content: "Drop file(s) to upload"
        })
    }

    private getDirectoryActions(): HTMLElement | undefined {
        return Public.createElement({
            id: "directory-actions",
            children: [
                Public.createElement({
                    innerHtml: this.svg.download,
                    title: "Download",
                    clss: "requires-selected",
                    listener: {
                        event: "click",
                        callback: () => {
                            this.fileManager.downloadFiles(this.filesToRequest, "FileTransfer")
                        }
                    }
                }),
                Public.createElement({
                    innerHtml: this.svg.delete,
                    title: "Delete",
                    clss: "requires-selected",
                    //TODO add delete action
                }),
                Public.createElement({
                    innerHtml: this.svg.select,
                    title: "Select",
                    listener: {
                        event: "click",
                        callback: () => {
                            this.filesTab?.classList.toggle("select")
                            this.isSelectionOpen = !this.isSelectionOpen
                        }
                    }
                }),
                Public.createElement({
                    innerHtml: this.svg.upload,
                    title: "Upload",
                    listener: {
                        event: "click",
                        callback: () => this.selectFilesToUpload()
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


    private filesToRequest: FileToDownload[] = []

    private addToRequestList(f: File) {
        const item = { id: f.path, size: f.size, name: f.name }
        if (!this.filesToRequest.includes(item)) {
            this.filesToRequest.push(item)
        }
    }
    private removeFromRequestList(f: File) {
        const item = { id: f.path, size: f.size, name: f.name }
        this.filesToRequest = this.filesToRequest.filter(f => f != item)
    }

    private async selectFilesToUpload() {
        if (this.currentPath == undefined) return
        await appWindow.setAlwaysOnTop(false)
        const selectedPaths = await open({
            directory: false,
            multiple: true,
            title: "Select Files To Upload",
        })
        await appWindow.setAlwaysOnTop(true)
        if (selectedPaths == null) return

        let filePathsToUpload: string[] = []

        if (Array.isArray(selectedPaths)) filePathsToUpload = selectedPaths
        else filePathsToUpload = [selectedPaths]

        this.uploadFiles(filePathsToUpload)
    }

    async setDragAndDropEvents() {
        this.unlistenDropListener = await appWindow.onFileDropEvent((event) => {
            if (event.payload.type === 'hover') {
                this.filesTab?.classList.add("drop-active")
            } else if (event.payload.type === 'drop') {
                this.filesTab?.classList.remove("drop-active")
                this.uploadFiles(event.payload.paths)
                console.log('User dropped', event.payload);
            } else {
                this.filesTab?.classList.remove("drop-active")
            }
        });
    }

    private async uploadFiles(filePathsToUpload: string[]) {
        const filesToUpload: FileToUpload[] = await Promise.all(filePathsToUpload.map(async (p) => {
            const baseName = await basename(p)
            console.log(baseName)
            const extName = await extname(p)
            const target = await join(this.currentPath!!, `${baseName}.${extName}`)
            return {
                source: p,
                target
            }
        }))

        console.log(filesToUpload)

        await invoke("send_files", { address: Socket.connectedServer, filesToUpload })
    }
}

type FileToUpload = {
    source: string,
    target: string
}
