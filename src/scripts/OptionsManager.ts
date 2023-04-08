import { WebviewWindow } from "@tauri-apps/api/window"
import { Socket } from "../connection/Socket"
import { listen } from "@tauri-apps/api/event"

export default class OptionsManager {
    constructor() {
        this.setListeners()
    }

    private async setListeners() {
        const btnSync = this.i("sync")
        if (btnSync) btnSync.onclick = this.sync.bind(this)
        const btnSettings = this.i("settings")
        if (btnSettings) btnSettings.onclick = this.openSettings.bind(this)

        await listen("reload", () => { location.reload() })
    }

    sync() {
        Socket.send("MediaSessionsRequest", "")
    }

    openSettings() {
        new WebviewWindow("settings", {
            url: './src/views/settings/settings.html',
            title: "Uzayan - Settings"
        })
    }

    private i(id: string): HTMLElement | null {
        return document.getElementById(id)
    }
}