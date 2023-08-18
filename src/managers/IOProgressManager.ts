import { open } from "@tauri-apps/api/shell"
import { listen } from "@tauri-apps/api/event"
import Public from "../utils/Public"

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

    private createProgressBar(progress: ProgressUpdate) {
        const pb = Public.createElement({
            clss: "io-progress",
            id: `p-${progress.id}`,
            innerHtml: `
                <div class="io-progress-name">${progress.name}</div>
                <div class="io-progress-perc">${progress.perc}</div>
            `,
            children: [
                Public.createElement({
                    clss: "io-progress-actions",
                    content: "Actions"
                })
            ]
        })

        this.ioContainer?.insertAdjacentElement("afterbegin", pb)
    }

    private updateProgressBar(pb: Element, payload: ProgressUpdate) {
        throw new Error("Method not implemented.")
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