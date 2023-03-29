import { listen } from "@tauri-apps/api/event"
import IOSvg from "../assets/io.svg"
import { Public } from "./Public"

export default class IOManager {
    private svg = new IOSvg()
    private ioContainer = document.getElementById("io-container")
    private activeBars: { [id: number]: HTMLElement } = {}

    constructor() {
        this.listenMessages()
    }

    private async listenMessages() {
        await listen<DowloadProgressBarRequest>("CreateInputProgressBar", (event) => {
            this.createNewInputProgressBar(event.payload)
        })

        await listen<UpdateProgressRequest>("UpdateProgress", (event) => {
            this.activeBars[event.payload.progressId]
                ?.style.setProperty("--ratio", `${event.payload.ratio}%`)
        })
    }

    private async createNewInputProgressBar(request: DowloadProgressBarRequest) {
        if (this.ioContainer == null) return
        const progress = this.getProgress(request.receivedFiles, request.fileName)
        progress.setAttribute("style", "--ratio: 0%")

        this.ioContainer.appendChild(progress)
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