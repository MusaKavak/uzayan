import { Socket } from "../connection/Socket"

export class OptionsManager {
    constructor() {
        this.setListeners()
    }

    private setListeners() {
        const btnSync = this.i("sync")
        if (btnSync != null) btnSync.onclick = this.sync.bind(this)
    }

    sync() {
        Socket.send("MediaSessionsRequest", "")
        Socket.send("NotificationsRequest", "")

    }

    private i(id: string): HTMLElement | null {
        return document.getElementById(id)
    }
}