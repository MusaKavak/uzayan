import { appWindow, currentMonitor, LogicalPosition, LogicalSize } from "@tauri-apps/api/window"
import { Settings } from "../data/settings"

export async function setWindowOnStartup() {

    await appWindow.setDecorations(false)
    await appWindow.setAlwaysOnTop(true)

    await setWindowSize(
        Settings.settings.BarWidth,
        Settings.settings.BarHeightWhenClosed
    )

    await setWindowPosition(
        Settings.settings.WindowPositionFromLeft,
        Settings.settings.IsWindowOnBottom
    )
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
            y = size.height - Settings.settings.BarHeightWhenClosed
        } else throw Error("Current Screen Is Not Defined")
    }
    //This feature is not working sometimes at first run. So run it two times (Tauri version: 1.2)
    const position = new LogicalPosition(x, y)
    await appWindow.setPosition(position)
    setTimeout(() => appWindow.setPosition(position), 100);

    //This method doesn't just work on startup, it also works when user preferences change so update settings
    Settings.settings.WindowPositionFromLeft = x
    Settings.settings.IsWindowOnBottom = isOnBottom

    return
}