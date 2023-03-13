import { invoke } from "@tauri-apps/api";
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

    getBody(children: File[] | undefined): HTMLElement {
        return Public.createElement({
            id: "directory-body",
            children: children?.map(f => this.getRow(f))
        })
    }

    getRow(f: File): HTMLElement {
        const callback = () => {
            if (f.isFile) this.fileRequest(f.path, f.name, f.extension)
            else this.fileSystemRequest(f.path)
        }

        return Public.createElement({
            clss: "directory-row card",
            innerHtml: `
                <span id="file-icon">${this.getFileIcon()}</span>
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
            children: [
                this.getGoBackButton(file.parent),
                Public.createElement({
                    id: "directory-name",
                    content: file.name
                })
            ]
        })
    }

    getGoBackButton(parent: File | undefined): HTMLElement | undefined {
        if (parent != undefined) {
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

    private getFileIcon(): string {
        return this.svg.folder
    }

    private fileSystemRequest(path: string | undefined) {
        Socket.send("FileSystemRequest", { path })
    }

    private async fileRequest(path?: string, name?: string, extension?: string) {
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