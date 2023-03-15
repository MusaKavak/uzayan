import { invoke } from "@tauri-apps/api";
import FileSvg from "../assets/file.svg";
import { Socket } from "../connection/Socket";
import { File } from "../types/File";
import { Public } from "./Public";

export default class FileManager {

    private filesTab = document.getElementById("files-tab-body")
    private svg = new FileSvg()

    createFiles(file: File) {
        console.log(file.isRoot)
        console.log(file.size)
        if (this.filesTab) {
            this.filesTab.innerHTML = ""
            this.filesTab.appendChild(this.getHeader(file))
            this.filesTab.appendChild(this.getBody(file.children))
        }
    }


    getBody(children: File[] | undefined): HTMLElement {
        return Public.createElement({
            id: "directory-body",
            children: children?.map(f => this.getRow(f))
        })
    }

    getRow(f: File): HTMLElement {
        const callback = () => {
            if (f.isFile) this.fileRequest(f.path, f.name, f.extension, f.size)
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

    getHeader(file: File): HTMLElement {
        return Public.createElement({
            id: "directory-header",
            clss: "card",
            children: [
                this.getGoBackButton(file.parent, file.isRoot),
                Public.createElement({
                    id: "directory-name",
                    content: file.name
                })
            ]
        })
    }

    getGoBackButton(parent: File | undefined, isRoot?: boolean): HTMLElement | undefined {
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

    private async fileRequest(path?: string, name?: string, extension?: string, size?: number) {
        if (path == undefined) return
        const saveLocation = await Public.getDownloadFileLocation()
        if (saveLocation == undefined) return
        const message = (JSON.stringify({ message: "FileRequest", input: { path } })) + "\n"
        invoke(
            "connect_for_large_file_transaction",
            {
                message,
                address: Socket.connectedServer,
                name,
                extension,
                saveLocation
            }
        )
    }
}