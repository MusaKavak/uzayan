import { appWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window"
import { WindowLayoutMethods } from "../types/Callbacks"
import { Public } from "./Public"

export class WindowLayout {
    private size = new LogicalSize(0, 0)
    private position = new LogicalPosition(0, 0)

    constructor(private callbacks: WindowLayoutMethods, private body: HTMLElement) { }

    async setWindowOnStartup() {
        //KDE Plasma not allowing window size less than 200 when resizable false
        //await appWindow.setResizable(false)

        this.setWindowSize()

        this.setWindowPosition(Public.settings.WindowPositionFromLeft, 0)

        this.setListeners()
    }

    async setWindowSize(width: number = Public.settings.BarWidth, height: number = Public.settings.BarHeightWhenClosed) {
        this.size.width = width
        this.size.height = height
        await appWindow.setSize(this.size)
    }

    async setWindowPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
        if (Public.settings.IsWindowCentered) {
            const size = (await currentMonitor())?.size
            if (size != null) this.position.x = size.width - Public.settings.BarWidth
        }

        //This feature is not working sometimes at first run. So run it two times (Tauri version: 1.2)
        await appWindow.setPosition(this.position)
        setTimeout(() => appWindow.setPosition(this.position), 100);

        //This method doesn't just work on startup, it also works when user preferences change. So update settings
        Public.settings.WindowPositionFromLeft = x
    }

    setListeners() {
        console.log("d")
        this.body.onmouseenter = this.openWindow.bind(this)
        this.body.onmouseleave = this.closeWindow.bind(this)
    }

    async openWindow() {
        if (!Public.isWindowOpen && !Public.isWindowOpening) {
            this.body.classList.add("window-opening")
            Public.isWindowOpening = true
            this.setWindowSize(undefined, 800)
            setTimeout(() => {
                console.log("open")
                Public.isWindowOpening = false
                Public.isWindowOpen = true
                this.body.classList.remove("window-opening")
                this.body.classList.add("window-open")
                this.setWindowSize(undefined, this.body.offsetHeight)
                this.callbacks.windowOpened()
            }, Public.settings.WindowOpeningDuration);
        }
    }

    async closeWindow() {
        Public.isWindowOpen = false
        console.log("close")
        Public.isWindowOpening = false
        setTimeout(() => {
            this.body.classList.remove("window-opening", "window-open")
            this.setWindowSize()
            this.callbacks.windowClosed()
        }, Public.settings.WindowOpeningDuration);
    }


}