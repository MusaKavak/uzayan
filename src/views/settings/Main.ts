import { appWindow } from "@tauri-apps/api/window"
import { getLanguageFile } from "../../utils/Language"
import { getAppSettings, getAppearanceSettings, loadAppearanceSettings } from "../../utils/Settings"
import { createAppSettings } from "./scripts/AppSettings"
import { createAppearanceSettings } from "./scripts/AppearanceSettings"
import { SettingsStore } from "./scripts/SettingsStore"
import { emit } from "@tauri-apps/api/event"
import { appIcon } from "../../assets/app.svg"

SettingsStore.appSettings = await getAppSettings()
SettingsStore.appearanceSettings = await getAppearanceSettings()
await loadAppearanceSettings(SettingsStore.appSettings)
const lang = await getLanguageFile(SettingsStore.appSettings.LanguageCode)
createAppearanceSettings(lang.Appearance)
createAppSettings(lang.AppSettings)


const icon = document.getElementById("icon")
if (icon) icon.innerHTML = appIcon

document.getElementById("ac-cancel")?.addEventListener("click", () => {
    appWindow.close()
})
document.getElementById("ac-ok")?.addEventListener("click", async () => {
    SettingsStore.saveSettings()
    await emit("reload")
    appWindow.close()
})
document.getElementById("ac-apply")?.addEventListener("click", async () => {
    SettingsStore.saveSettings()
    await emit("reload")
    await loadAppearanceSettings(SettingsStore.appSettings)
})
