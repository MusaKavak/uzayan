import { createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { appConfigDir, join } from "@tauri-apps/api/path"
import { AppearanceSettings, AppSettings, DefaultAppearanceSettings, DefaultAppSettings } from "../types/local/Settings"

async function getSettingsFile<T>(base: T, name: string): Promise<T> {
    const filePath = await join(await appConfigDir(), `${name}.settings`)
    let settings: T = base

    if (await exists(filePath)) {
        const string = await readTextFile(filePath)
        const partialSettings = JSON.parse(string) as Partial<T>
        settings = Object.assign({}, base, partialSettings)
    } else {
        const configDir = await appConfigDir()
        if (!(await exists(configDir))) await createDir(configDir)
    }
    console.log(settings)
    await writeSettingsFile(settings, name)
    return settings
}

export async function writeSettingsFile<T>(settings: T, name: string) {
    const filePath = await join(await appConfigDir(), `${name}.settings`)
    await writeTextFile(filePath, JSON.stringify(settings, null, 2))
}

export async function getAppSettings(): Promise<AppSettings> {
    return await getSettingsFile(DefaultAppSettings, "app")
}

export async function getAppearanceSettings(): Promise<AppearanceSettings> {
    return await getSettingsFile(DefaultAppearanceSettings, "appearance")
}

export async function loadAppearanceSettings(as: AppSettings) {
    const html = document.querySelector("html")
    const appearanceSettings = await getAppearanceSettings()

    for (const key in appearanceSettings.Colors) {
        html?.style.setProperty(key, appearanceSettings.Colors[key])
    }

    for (const key in appearanceSettings.Appearance) {
        html?.style.setProperty(key, appearanceSettings.Appearance[key])
    }

    html?.style.setProperty(
        "--sz-window-height-when-closed",
        `${as.Size.BarHeightWhenClosed - 1}px`
    )

    html?.style.setProperty(
        "--notification-duration",
        `${as.Duration.NotificationDuration}ms`
    )

    html?.style.setProperty("--transition", `${as.Duration.TransitionDuration}ms`)
}