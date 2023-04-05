import { readTextFile } from "@tauri-apps/api/fs"
import { resolveResource } from "@tauri-apps/api/path"
import { ApperanceSettings, AppSettings } from "../types/local/Settings"



export async function getAppSettings(): Promise<AppSettings> {
    const settings = await readTextFile(await resolveResource("resources/settings/app.settings.json"))
    return JSON.parse(settings)
}

export async function getApperanceSettings(): Promise<ApperanceSettings> {
    const settings = await readTextFile(await resolveResource("resources/settings/apperance.settings.json"))
    return JSON.parse(settings)
}