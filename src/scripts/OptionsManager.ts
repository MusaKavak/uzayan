export class OptionsManager {

    constructor(private send: (message: string, input: any, address: string) => void) {
        this.setListeners()
    }

    private setListeners() {
        const btnSync = this.i("sync")
        if (btnSync != null) btnSync.onclick = this.sync.bind(this)
    }

    sync() {
        this.send("MediaSessionsRequest", "", "192.168.1.105:34724")

    }

    private i(id: string): HTMLElement | null {
        return document.getElementById(id)
    }
}