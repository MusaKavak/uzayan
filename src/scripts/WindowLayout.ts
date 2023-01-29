import { appWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window"
import { Public } from "./Public"

export async function setWindowOnStartup() {

    await appWindow.setDecorations(false)
    await appWindow.setAlwaysOnTop(true)

    await setWindowSize(
        Public.settings.BarWidth,
        Public.settings.BarHeightWhenClosed
    )

    await setWindowPosition(
        Public.settings.WindowPositionFromLeft,
        Public.settings.IsWindowOnBottom
    )

    setListeners()
}

async function setWindowSize(width: number, height: number) {
    await appWindow.setSize(new LogicalSize(width, height))
    return
}

async function setWindowPosition(x: number, isOnBottom: boolean) {
    let y = 0

    if (isOnBottom) {
        const size = (await currentMonitor())?.size
        if (size != null) {
            y = size.height - Public.settings.BarHeightWhenClosed
        } else throw Error("Current Screen Is Not Defined")
    }
    //This feature is not working sometimes at first run. So run it two times (Tauri version: 1.2)
    const position = new LogicalPosition(x, y)
    await appWindow.setPosition(position)
    setTimeout(() => appWindow.setPosition(position), 100);

    //This method doesn't just work on startup, it also works when user preferences change. So update settings
    Public.settings.WindowPositionFromLeft = x
    Public.settings.IsWindowOnBottom = isOnBottom

    return
}

function setListeners() {
    document.body.onmouseenter = openWindow
    document.body.onmouseleave = closeWindow
    const resizeObserver = new ResizeObserver(resizeWindow)
    resizeObserver.observe(document.body)
}

async function openWindow() {
    if (!Public.isWindowOpen && !Public.isWindowOpening) {
        document.body.classList.add("window-opening")
        Public.isWindowOpening = true
        setTimeout(() => {
            document.body.classList.remove("window-opening")
            document.body.classList.add("window-open")
            Public.isWindowOpening = false
            Public.isWindowOpen = true
        }, Public.settings.WindowOpeningDuration);
    }
}

async function closeWindow() {
    Public.isWindowOpen = false
    Public.isWindowOpening = false
    setTimeout(() => {
        document.body.classList.remove("window-opening", "window-open")
    }, Public.settings.WindowOpeningDuration);
}

var size = new LogicalSize(Public.settings.BarWidth, 0)
async function resizeWindow() {
    size.height = document.body.offsetHeight
    appWindow.setSize(size)
}
