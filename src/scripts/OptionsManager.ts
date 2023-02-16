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
        Socket.send("MediaSessionsRequest", "", "192.168.1.105:34724")

    }

    private i(id: string): HTMLElement | null {
        return document.getElementById(id)
    }
}