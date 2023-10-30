import { listen } from "@tauri-apps/api/event"
import Public from "../utils/Public"
import IconProvider from "../utils/IconProvider"

export default class IOProgressManager {
    private ioContainer = document.getElementById("io-container")

    constructor() {
        this.listenMessages()
    }

    private async listenMessages() {
        await listen<ProgressUpdate>("progress_update", (e) => {
            console.log(e)
            const pb = document.querySelector(`.io-progress#p-${e.payload.id}`)

            pb ? this.updateProgressBar(pb, e.payload) : this.createProgressBar(e.payload)
        })
    }

    private async createProgressBar(progress: ProgressUpdate) {
        const pb = Public.createElement({
            clss: "io-progress",
            id: `p-${progress.id}`,
            innerHtml: `
                <div class="io-progress-icon">${await IconProvider.get(progress.isout ? "upload" : "download")}</div>
                <div class="io-progress-bar style="--perc:0;"><div>${progress.name}</div></div>      
            `,
            children: [
                Public.createElement({
                    clss: "io-progress-actions",
                    innerHtml: `<div class="io-progress-perc">0</div>`
                })
            ]
        })

        this.ioContainer?.insertAdjacentElement("afterbegin", pb)
    }

    private updateProgressBar(pb: Element, payload: ProgressUpdate) {
        (pb.querySelector(".io-progress-bar") as HTMLElement | null)?.style.setProperty("--perc", payload.perc)
        pb.querySelector(".io-progress-perc")!!.textContent = payload.perc
    }


}

type ProgressUpdate = {
    id: string,
    name: string,
    perc: string,
    isout: boolean,
    error?: string,
    path?: string
}