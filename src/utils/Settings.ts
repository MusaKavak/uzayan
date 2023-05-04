import { readTextFile } from "@tauri-apps/api/fs"
import { resolveResource } from "@tauri-apps/api/path"
import { ApperanceSettings, AppSettings } from "../types/local/Settings"
import Public from "../utils/Public"

async function getAppSettings(): Promise<AppSettings> {
    const settings = await readTextFile(await resolveResource("resources/settings/app.settings.json"))
    return JSON.parse(settings)
}

async function getApperanceSettings(): Promise<ApperanceSettings> {
    const settings = await readTextFile(await resolveResource("resources/settings/apperance.settings.json"))
    return JSON.parse(settings)
}

export async function loadSettings() {
    Public.settings = await getAppSettings()
    loadApperanceSettings(Public.settings)
}

async function loadApperanceSettings(as: AppSettings) {
    const html = document.querySelector("html")
    const apperanceSettings = await getApperanceSettings()
    for (const key in apperanceSettings) {
        html?.style.setProperty(key, apperanceSettings[key])
    }

    html?.style.setProperty(
        "--sz-window-height-when-closed",
        `${as.BarHeightWhenClosed - 1}px`
    )

    html?.style.setProperty("--transition", `${as.TransitionDuration}ms`)
}