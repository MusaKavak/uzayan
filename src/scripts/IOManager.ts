import IOSvg from "../assets/io.svg"
import { Public } from "./Public"
import { open } from "@tauri-apps/api/shell"
import { listen } from "@tauri-apps/api/event"
import { join } from "@tauri-apps/api/path"

export default class IOManager {
    private svg = new IOSvg()
    private ioContainer = document.getElementById("io-container")

    constructor() {
        this.listenMessages()
    }

    private async listenMessages() {
        await listen<{ id: number, is_input: boolean, downloadLocation?: string }>("progress_bar_request", (e) => {
            console.log(e.payload)
            this.createNewInputProgressBar(e.payload.id, e.payload.is_input)
        })
        await listen<ProgressUpdate>("progress_update", (e) => {
            this.updateProgressBar(e.payload)
        })
    }


    async createNewInputProgressBar(id: number, isInput: boolean) {
        if (this.ioContainer == null) return
        const idAtrr = "io-" + id
        console.log(isInput)
        this.ioContainer.appendChild(this.getProgressContainer(idAtrr, isInput))
    }


    private getProgressContainer(id: string, isInput: boolean): HTMLElement {
        const container = Public.createElement({
            clss: `io-progress ${isInput ? "io-input" : ""}`,
            id,
            children: [
                this.getHeader(isInput),
                this.getBar(id, isInput)
            ]
        })
        container.setAttribute("style", "--ratio: 0%")
        return container
    }

    private getBar(id: string, isInput: boolean): HTMLElement {
        return Public.createElement({
            clss: "io-bar",
            children: [
                this.getFileName(id, isInput),
                this.getProgressRatio(),
                this.getBarActions(id, isInput)
            ]
        })
    }

    private getFileName(id: string, isInput: boolean): HTMLElement {
        const fileName = document.createElement("div")
        fileName.classList.add("io-file-name")
        if (isInput) fileName.addEventListener("click", () => {
            const path = fileName.getAttribute("path")
            if (path) {
                open(path)
                this.removeProgress(id)
            }
        })
        return fileName
    }

    private getProgressRatio(): HTMLElement {
        return Public.createElement({
            clss: "io-progress-ratio",
        })
    }

    private getBarActions(id: string, isInput: boolean): HTMLElement {
        return Public.createElement({
            clss: "io-bar-actions",
            children: [
                this.getCancel(id),
                isInput ? this.getOpenFolder(id) : undefined,
                this.getDone(id)
            ],
        })
    }

    private getDone(id: string): HTMLElement {
        return Public.createElement({
            clss: "io-action-done",
            innerHtml: this.svg.done,
            title: "Done",
            listener: {
                event: 'click',
                callback: () => this.removeProgress(id)
            }
        })
    }

    private getOpenFolder(id: string): HTMLElement {
        const openFolderButton = document.createElement("div")
        openFolderButton.innerHTML = this.svg.folder
        openFolderButton.setAttribute("title", "Show In Folder")
        openFolderButton.classList.add("io-action-done", "io-open-folder")

        openFolderButton.addEventListener("click", () => {
            const path = openFolderButton.getAttribute("path")
            if (path) {
                open(path)
            }
            this.removeProgress(id)
        })

        return openFolderButton
    }

    private getCancel(id: string): HTMLElement {
        return Public.createElement({
            clss: "io-action-undone",
            title: "Cancel",
            innerHtml: this.svg.cancel,
            listener: {
                event: 'click',
                callback: () => this.removeProgress(id)
            }
        })
    }

    private removeProgress(id: string) {
        const progress = document.getElementById(id)
        progress?.classList.add("removing")
        setTimeout(() => {
            progress?.remove()
        }, Public.settings.TransitionDuration)
    }

    private getHeader(isInput: boolean): HTMLElement {
        return Public.createElement({
            clss: "io-header",
            children: [
                this.getIcon(isInput),
                this.getFileRatio(),
            ]
        })
    }

    private getIcon(_isInput: boolean): HTMLElement {
        return Public.createElement({
            clss: "io-header-icon",
            innerHtml: this.svg.io,
        })
    }

    private getFileRatio(): HTMLElement {
        return Public.createElement({
            clss: "io-file-ratio"
        })
    }

    private async updateProgressBar(p: ProgressUpdate) {
        const container = document.querySelector('#io-' + p.id) as HTMLElement
        if (!container) return

        const name = container.querySelector(".io-file-name")
        if (name) {
            name.textContent = p.name
            name.setAttribute("title", p.name)
        }

        const progressElement = container.querySelector(".io-progress-ratio")
        const progress = `${p.progress.toFixed(2)}%`
        if (progress == "100.00%") container.classList.add("done")
        else container.classList.remove("done")
        if (progressElement) progressElement.textContent = progress
        container.style.setProperty("--ratio", progress)

        const ratio = container.querySelector(".io-file-ratio")
        if (ratio) ratio.textContent = p.ratio

        if (p.path) {
            name?.setAttribute("path", p.path)
            container.querySelector(".io-open-folder")?.setAttribute("path", await join(p.path, ".."))
        }
    }
}

type ProgressUpdate = {
    id: number,
    name: string,
    progress: number,
    ratio: string,
    path?: string
}