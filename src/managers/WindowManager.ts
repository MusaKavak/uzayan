import { appWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window"
import Public from "../utils/Public"

export default class WindowManager {
    private size = new LogicalSize(0, 0)
    private position = new LogicalPosition(0, 0)
    private blockMouseEvents = false

    constructor(private body: HTMLElement) { this.setWindowOnStartup() }

    private async setWindowOnStartup() {
        //KDE Plasma not allowing window size less than 200 when resizable false
        //await appWindow.setResizable(false)

        this.setWindowSize()

        this.setWindowPosition(Public.settings.Position.WindowPositionFromLeft, 0)

        this.setListeners()

        if (localStorage.getItem("OpenWindowOnStart")) {
            this.openWindow()
            localStorage.removeItem("OpenWindowOnStart")
        }
    }

    async setWindowSize(width: number = Public.settings.Size.BarWidth, height: number = Public.settings.Size.BarHeightWhenClosed) {
        this.size.width = width
        this.size.height = height
        await appWindow.setMinSize(this.size)
        await appWindow.setMaxSize(this.size)
        await appWindow.setSize(this.size)
    }

    async setWindowPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
        if (Public.settings.Position.IsWindowCentered) {
            const size = (await currentMonitor())?.size
            if (size != null) this.position.x = size.width - Public.settings.Size.BarWidth
        }

        //This feature is not working sometimes at first run. So run it two times (Tauri version: 1.2)
        await appWindow.setPosition(this.position)
        setTimeout(() => appWindow.setPosition(this.position), 100);
    }

    private setListeners() {
        this.body.onmouseenter = this.openWindow.bind(this)
        this.body.onmouseleave = this.closeWindow.bind(this)
        this.body.onmouseover = () => { this.blockMouseEvents = false }
        const mouseEventBlock = document.getElementById("mouse-event-block")
        if (mouseEventBlock) mouseEventBlock.onmouseenter = () => this.blockMouseEvents = true
    }

    async openWindow() {
        setTimeout(() => {
            if (!Public.isWindowOpen) {
                Public.isWindowOpen = true
                this.setWindowSize(undefined, 600)
                this.body.classList.add("window-open")
            }
        }, Public.settings.Duration.WindowOpenDelay);
    }

    async closeWindow() {
        if (!Public.isWindowPinned && !this.blockMouseEvents) {
            setTimeout(() => {
                if (Public.isWindowOpen) {
                    this.body.classList.remove("window-open")
                    setTimeout(() => {
                        this.setWindowSize()
                        Public.isWindowOpen = false
                    }, Public.settings.Duration.TransitionDuration);
                }
            }, Public.settings.Duration.WindowOpenDelay);
        }
    }

    async bounceNotification() {
        if (!Public.isWindowOpen) {
            this.setWindowSize(undefined, 600)

            setTimeout(() => {
                this.setWindowSize(undefined, document.body.clientHeight)
            }, Public.settings.Duration.TransitionDuration);
        }
    }

    async unbounceNotification() {
        if (!Public.isWindowOpen) {
            this.setWindowSize(undefined, document.body.clientHeight)
        }
    }
}