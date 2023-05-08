import { Language } from "../../../types/local/Language";
import { createSettingSection } from "./ElementCreator";
import { createColorInput } from "./InputCreator";
import { SettingsStore } from "./SettingsStore";

export function createAppearanceSettings(lang: Language["AppearanceSettings"]) {
    createColors(lang.Colors)
}

function createColors(lang: Language["AppearanceSettings"]["Colors"]) {
    const cards: HTMLElement[] = []

    for (const key in lang) {
        if (key == "Self") continue
        cards.push(createColorInput(SettingsStore.appearanceSettings.Colors, key, lang[key]))
    }
    createSettingSection(lang.Self, cards)
}