import { join } from "@tauri-apps/api/path";
import Socket from "../connection/Socket";
import { File } from "../types/network/File";
import DialogManager from "./DialogManager";
import FileTransferManager from "./FileTransferManager";
import Public from "../utils/Public";
import { open } from "@tauri-apps/api/dialog";
import { appWindow } from "@tauri-apps/api/window";
import { UnlistenFn } from "@tauri-apps/api/event";
import IconProvider from "../utils/IconProvider";

export default class FileManager {

    private filesTab = document.getElementById("files-tab-body")
    private allowToCreate = true
    private isSelectionOpen = false
    private currentPath?: string

    unlistenDropListener: UnlistenFn = () => { }

    constructor(
        private fileTransferManager: FileTransferManager,
        private dialogManager: DialogManager) {
        this.filesTab?.classList.toggle("select")
    }

    createFiles(file: File) {
        this.getIcons().then((icons) => {
            if (this.filesTab && this.allowToCreate) {
                this.filesTab.innerHTML = ""
                this.filesTab.appendChild(this.getHeader(icons, file))
                this.filesTab.appendChild(this.getBody(icons.directory, file.children))
                this.allowToCreate = false
                this.currentPath = file.path
                this.filesToRequest = []
            }
        })
    }


    private getBody(directoryIcon: string, children: File[] | undefined): HTMLElement {
        return Public.createElement({
            id: "directory-body",
            children: children?.map(f => this.getDirectoryItem(directoryIcon, f))
        })
    }

    private getDirectoryItem(directoryIcon: string, f: File): HTMLElement {
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
                <span class="file-icon">${this.getFileIcon(directoryIcon, f.isFile, f.extension)}</span>
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
                    this.fileTransferManager.receiveFiles([{ sourcePath: f.path, fileName: f.name }])
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

    private getHeader(icons: Icons, file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header",
            clss: "card",
            children: [
                this.getHeaderTitle(icons.back, file),
                this.getDropMessage(),
                this.getDirectoryActions(icons.actions)
            ]
        })
    }

    private getHeaderTitle(backIcon: string, file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header-title",
            children: [
                this.getGoBackButton(backIcon, file.parent, file.isRoot),
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

    private getDirectoryActions(actionIcons: ActionIcons): HTMLElement | undefined {
        return Public.createElement({
            id: "directory-actions",
            children: [
                Public.createElement({
                    innerHtml: actionIcons.download,
                    title: "Download",
                    clss: "requires-selected",
                    listener: {
                        event: "click",
                        callback: () => {
                            this.fileTransferManager.receiveFiles(this.filesToRequest)
                        }
                    }
                }),
                Public.createElement({
                    innerHtml: actionIcons.delete,
                    title: "Delete",
                    clss: "requires-selected",
                    //TODO add delete action
                }),
                Public.createElement({
                    innerHtml: actionIcons.select,
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
                    innerHtml: actionIcons.upload,
                    title: "Upload",
                    listener: {
                        event: "click",
                        callback: () => this.selectFilesToUpload()
                    }
                })
            ]
        })
    }

    private getGoBackButton(backIcon: string, parent?: File, isRoot?: boolean): HTMLElement | undefined {
        if (parent && !isRoot) {
            const callback = () => this.fileSystemRequest(parent.path)

            return Public.createElement({
                id: "directory-goback",
                innerHtml: backIcon,
                title: parent.name,
                listener: {
                    event: "click",
                    callback
                }
            })
        } else return
    }

    private getFileIcon(directoryIcon: string, isFile?: boolean, extension?: string,): string {
        if (isFile) return `<span>${extension}</span>`
        else return `<span>${directoryIcon}</span>`

    }

    private fileSystemRequest(path: string | undefined) {
        this.allowToCreate = true
        Socket.send("FileSystemRequest", { path })
    }


    private filesToRequest: { sourcePath: string, fileName: string }[] = []

    private addToRequestList(f: File) {
        const item = { sourcePath: f.path, fileName: f.name }
        if (!this.filesToRequest.includes(item)) {
            this.filesToRequest.push(item)
        }
    }
    private removeFromRequestList(f: File) {
        const item = { sourcePath: f.path, fileName: f.name }
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
        this.fileTransferManager.sendFiles(filePathsToUpload, this.currentPath!!)
    }

    private async getIcons(): Promise<Icons> {
        return {
            actions: {
                download: await IconProvider.get("download"),
                delete: await IconProvider.get("delete"),
                select: await IconProvider.get("select"),
                upload: await IconProvider.get("upload"),
            },
            back: await IconProvider.get("back"),
            directory: await IconProvider.get("directory"),
        }
    }
}

type Icons = {
    actions: ActionIcons,
    back: string,
    directory: string,
}

type ActionIcons = {
    download: string,
    delete: string,
    select: string,
    upload: string,
}

