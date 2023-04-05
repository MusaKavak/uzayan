import FileSvg from "../assets/file.svg";
import { Socket } from "../connection/Socket";
import { File } from "../types/network/File";
import FileManager from "./FileManager";
import { Public } from "./Public";

export default class FileTabManager {

    private filesTab = document.getElementById("files-tab-body")
    private svg = new FileSvg()
    private allowToCreate = true
    private isSelectionOpen = false

    constructor(private fileManager: FileManager) {
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
            clss: "directory-item " + (f.isFile ? "file" : ""),
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
        return Public.createElement({
            clss: "directory-item-menu",
            children: [
                this.getDeleteButton(f.path),
                this.getRenameButton(),
                this.getDownloadButton()
            ]
        })
    }

    private getDownloadButton(): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Download"
        })
    }

    private getRenameButton(): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Rename",
        })
    }

    private getDeleteButton(path?: string): HTMLElement {
        return Public.createElement({
            clss: "button",
            content: "Delete",
            listener: {
                event: "click",
                callback: () => { Socket.send("DeleteFile", { path }) }
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
            console.log(this.filesToRequest)
        })
        return chbx
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
                    innerHtml: this.svg.download,
                    title: "Download",
                    clss: "requires-selected",
                    listener: {
                        event: "click",
                        callback: () => { this.fileManager.requestFiles(this.filesToRequest) }
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

}
