import { createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { appConfigDir, join } from "@tauri-apps/api/path"
import { ApperanceSettings, AppSettings, DefaultApperanceSettings, DefaultAppSettings } from "../types/local/Settings"
import Public from "../utils/Public"

async function getSettingsFile<T>(base: T, name: string): Promise<T> {
    const filePath = await join(await appConfigDir(), `${name}.settings.json`)
    let settings: T = base

    if (await exists(filePath)) {
        const string = await readTextFile(filePath)
        const partialSettings = JSON.parse(string) as Partial<T>
        settings = Object.assign({}, base, partialSettings)
    } else {
        const configDir = await appConfigDir()
        if (!(await exists(configDir))) await createDir(configDir)
    }

    await writeSettingsFile(settings, name)
    return settings
}

export async function writeSettingsFile<T>(settings: T, name: string) {
    const filePath = await join(await appConfigDir(), `${name}.settings.json`)
    await writeTextFile(filePath, JSON.stringify(settings, null, 2))
}

export async function getAppSettings(): Promise<AppSettings> {
    return await getSettingsFile(DefaultAppSettings, "app")
}

export async function getApperanceSettings(): Promise<ApperanceSettings> {
    return await getSettingsFile(DefaultApperanceSettings, "apperance")
}

async function loadApperanceSettings(as: AppSettings) {
    const html = document.querySelector("html")
    const apperanceSettings = await getApperanceSettings()

    for (const key in apperanceSettings) {
        html?.style.setProperty(key, apperanceSettings[key])
    }

    html?.style.setProperty(
        "--sz-window-height-when-closed",
        `${as.Size.BarHeightWhenClosed - 1}px`
    )

    html?.style.setProperty("--transition", `${as.Duration.TransitionDuration}ms`)
}

export async function loadSettings() {
    Public.settings = await getAppSettings()
    loadApperanceSettings(Public.settings)
}