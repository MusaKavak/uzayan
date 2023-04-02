import { invoke } from "@tauri-apps/api"
import IOSvg from "../assets/io.svg"
import { Public } from "./Public"
import { open } from "@tauri-apps/api/shell"

export default class IOManager {
    private svg = new IOSvg()
    private ioContainer = document.getElementById("io-container")
    private currentContainer?: HTMLElement
    private currentFileName?: HTMLElement
    private currentRatio?: HTMLElement
    private currentFileInfo?: HTMLElement
    private progressIndex = 0

    constructor() {
        this.listenMessages().then(() => { })
    }

    async listenMessages() { }

    async createNewInputProgressBar(countOfFiles: number, firstFileName: string, path: string) {
        if (this.ioContainer == null) return
        this.progressIndex++
        const id = "io-" + this.progressIndex
        this.currentContainer = this.getProgressContainer(countOfFiles, firstFileName, path, id)
        this.syncProgress()
        this.ioContainer.appendChild(this.currentContainer)
    }

    nextFile(currentFileInfo: string, fileName: string) {
        this.setCurrentState({
            currentFileInfo,
            fileName,
            ratio: 0
        })
    }

    endOfProgress() {
        this.currentContainer?.classList.add("done")
    }

    private getProgressContainer(countOfFiles: number, firstFileName: string, path: string, id: string): HTMLElement {
        const container = Public.createElement({
            clss: "io-progress",
            id,
            children: [
                this.getHeader(countOfFiles),
                this.getBar(firstFileName, path, id)
            ]
        })
        container.setAttribute("style", "--ratio: 0%")
        return container
    }

    private getBar(firstFileName: string, path: string, id: string): HTMLElement {
        const fileName = document.createElement("div")
        fileName.textContent = firstFileName
        fileName.setAttribute("title", firstFileName)
        this.currentFileName = fileName
        return Public.createElement({
            clss: "io-bar",
            children: [
                fileName,
                this.getBarRatio(),
                this.getBarActions(path, id)
            ]
        })
    }

    private getBarRatio(): HTMLElement {
        const ratio = document.createElement("div");
        ratio.textContent = "0%"
        this.currentRatio = ratio
        return ratio
    }

    private getBarActions(path: string, id: string): HTMLElement {
        return Public.createElement({
            clss: "io-bar-actions",
            children: [
                this.getCancel(id),
                this.getOpenFolder(path, id),
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

    private getOpenFolder(path: string, id: string): HTMLElement {
        return Public.createElement({
            clss: "io-action-done",
            innerHtml: this.svg.folder,
            title: "Show In Folder",
            listener: {
                event: 'click',
                callback: () => {
                    open(path)
                    this.removeProgress(id)
                }
            }
        })
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

    private getHeader(countOfFiles: number): HTMLElement {
        return Public.createElement({
            clss: "io-header",
            children: [
                this.getIcon(),
                this.getCurrentFileInfo(countOfFiles),
            ]
        })
    }

    private getIcon(): HTMLElement {
        return Public.createElement({
            clss: "io-header-icon",
            innerHtml: this.svg.io,
        })
    }

    private getCurrentFileInfo(countOfFiles: number): HTMLElement {
        const currentFile = document.createElement("div")
        currentFile.textContent = `1/${countOfFiles}`
        this.currentFileInfo = currentFile
        return currentFile
    }

    private syncProgress() {
        const interval = setInterval(async () => {
            const progress = await invoke<number>("get_current_progress");
            if (progress == 100) clearInterval(interval)
            this.setCurrentState({ ratio: progress })
        }, 1000)
    }

    private setCurrentState(state: {
        ratio?: number,
        fileName?: string,
        currentFileInfo?: string,
    }) {
        if (state.ratio && this.currentContainer)
            this.currentContainer.style.setProperty("--ratio", `${state.ratio.toFixed(2)}%`)
        if (state.ratio && this.currentRatio)
            this.currentRatio.textContent = `${state.ratio.toFixed(2)}%`
        if (state.fileName && this.currentFileName) {
            this.currentFileName.textContent = state.fileName
        }
        if (state.currentFileInfo && this.currentFileInfo) {
            this.currentFileInfo.textContent = state.currentFileInfo
        }
    }
}