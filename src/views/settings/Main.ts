import { getLanguageFile } from "../../utils/Language"
import { getAppSettings, getAppearanceSettings, loadAppearanceSettings } from "../../utils/Settings"
import { createAppSettings } from "./scripts/AppSettings"
import { createAppearanceSettings } from "./scripts/AppearanceSettings"
import { SettingsStore } from "./scripts/SettingsStore"

SettingsStore.appSettings = await getAppSettings()
SettingsStore.appearanceSettings = await getAppearanceSettings()
await loadAppearanceSettings(SettingsStore.appSettings)
const lang = await getLanguageFile(SettingsStore.appSettings.LanguageCode)
createAppSettings(lang.AppSettings)
createAppearanceSettings(lang.AppearanceSettings)
