import { appWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window"
import { settings } from "../data/settings"

export async function setWindowOnStartup() {
    await appWindow.setDecorations(false)
    await setWindowSize(settings.BarWidth, settings.BarHeight)
    await setWindowPosition(settings.WindowPositionFromLeft, settings.IsWindowOnBottom)
}

async function setWindowSize(width: number, height: number) {
    await appWindow.setSize(new LogicalSize(width, height))
    return
}

async function setWindowPosition(x: number, isOnBottom: boolean) {

    var y = 0

    if (isOnBottom) {
        const size = (await currentMonitor())?.size
        if (size != null) {
            y = size.height - settings.BarHeight
        } else throw Error("Current Screen Is Not Defined")
    }

    await appWindow.setPosition(new LogicalPosition(x, y))

    settings.WindowPositionFromLeft = x
    settings.IsWindowOnBottom = isOnBottom
}