import { invoke } from "@tauri-apps/api"
import { listen } from "@tauri-apps/api/event"
import IOSvg from "../assets/io.svg"
import { Public } from "./Public"

export default class IOManager {
    private svg = new IOSvg()
    private ioContainer = document.getElementById("io-container")
    private activeBars: { [id: number]: HTMLElement } = {}

    constructor() {
        this.listenMessages().then(() => { })
    }

    private async listenMessages() {
        await listen<DowloadProgressBarRequest>("CreateInputProgressBar", (event) => {
            this.createNewInputProgressBar(event.payload)
        })

        await listen<UpdateProgressRequest>("UpdateProgress", (event) => {
            console.log(event.payload.ratio)
            this.activeBars[event.payload.progressId]
                ?.style.setProperty("--ratio", `${event.payload.ratio}%`)
        })
    }

    private async createNewInputProgressBar(request: DowloadProgressBarRequest) {
        if (this.ioContainer == null) return
        const progress = this.getProgress(request.receivedFiles, request.fileName)
        progress.setAttribute("style", "--ratio: 0%")
        if (this.activeBars[request.progressId]) {
            console.log("replacing")
            this.activeBars[request.progressId].replaceWith()
        } else {
            console.log("appending")
            this.ioContainer.appendChild(progress)
        }
        this.activeBars[request.progressId] = progress
        this.syncProgress(request.progressId)
    }

    private getProgress(received: string, fileName: string): HTMLElement {
        return Public.createElement({
            clss: "io-progress",
            children: [
                this.getHeader(received),
                this.getBar(fileName)
            ]
        })
    }

    private getBar(fileName: string): HTMLElement {
        return Public.createElement({
            clss: "io-bar",
            innerHtml: `<div>${fileName}</div>`,
            children: [this.getBarActions()]
        })
    }

    private getBarActions(): HTMLElement {
        return Public.createElement({
            clss: "io-bar-actions",
            innerHtml: `
            <span>cancel</span>
            <span>openlocation</span>
            <span>finish</span>
            `
        })
    }

    private getHeader(received: string): HTMLElement {
        return Public.createElement({
            clss: "io-header",
            innerHtml: `<div>${this.svg.io}</div>`,
            children: [
                this.getHeaderActions(received)
            ]
        })
    }

    private getHeaderActions(received: string): HTMLElement {
        return Public.createElement({
            clss: "io-header-actions",
            innerHtml: `<div>${received}</div>`,
        })
    }

    private syncProgress(id: number) {
        const interval = setInterval(async () => {
            const progress = await invoke<number>("get_current_progress");
            if (progress == 100) clearInterval(interval)
            this.activeBars[id]?.setAttribute("style", `--ratio: ${progress}%`)
        }, 1000)
    }
}

type DowloadProgressBarRequest = {
    progressId: number,
    receivedFiles: string,
    fileName: string,
}

type UpdateProgressRequest = {
    progressId: number
    ratio: number,
}