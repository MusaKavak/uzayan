import { WebviewWindow } from "@tauri-apps/api/window"
import { Socket } from "../connection/Socket"

export default class OptionsManager {
    constructor() {
        this.setListeners()
    }

    private setListeners() {
        const btnSync = this.i("sync")
        if (btnSync) btnSync.onclick = this.sync.bind(this)
        const btnSettings = this.i("settings")
        if (btnSettings) btnSettings.onclick = this.openSettings.bind(this)
    }

    sync() {
        Socket.send("MediaSessionsRequest", "")
        Socket.send("NotificationsRequest", "")

    }

    openSettings() {
        const window = new WebviewWindow("settings", {
            url: './src/views/settings/settings.html',
            title: "Uzayan - Settings"
        })
    }

    private i(id: string): HTMLElement | null {
        return document.getElementById(id)
    }
}