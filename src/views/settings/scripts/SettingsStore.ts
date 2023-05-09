import { AppSettings, AppearanceSettings } from "../../../types/local/Settings";
import { writeSettingsFile } from "../../../utils/Settings";

export class SettingsStore {
    static appSettings: AppSettings
    static appearanceSettings: AppearanceSettings

    static saveSettings() {
        writeSettingsFile(this.appSettings, "app")
        writeSettingsFile(this.appearanceSettings, "appearance")
    }
}