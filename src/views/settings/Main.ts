import { getLanguageFile } from "../../utils/Language"
import { getAppSettings, loadApperanceSettings } from "../../utils/Settings"
import { createAppSettings } from "./scripts/AppSettings"
import { SettingsStore } from "./scripts/SettingsStore"

SettingsStore.appSettings = await getAppSettings()
await loadApperanceSettings(SettingsStore.appSettings)
const lang = await getLanguageFile(SettingsStore.appSettings.LanguageCode)
console.log("lang")
createAppSettings(lang.AppSettings)
