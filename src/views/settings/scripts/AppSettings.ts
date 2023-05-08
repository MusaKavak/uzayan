import { Language } from "../../../types/local/Language";
import { createSettingCard, createSettingSection } from "./ElementCreator";
import { createBooleanInput, createNumberInput, createTextInput } from "./InputCreator";
import { SettingsStore } from "./SettingsStore";

export function createAppSettings(language: Language["AppSettings"]) {
    createSizeSection(language.Size)
    createPositionSection(language.Position)
    createDownloadSection(language.DownloadLocation)
    createDurationSection(language.Duration)
}

function createSizeSection(lang: Language["AppSettings"]["Size"]) {
    const cards: HTMLElement[] = [
        createSettingCard(
            lang.BarWidth,
            createNumberInput(
                SettingsStore.appSettings.Size,
                "BarWidth",
            ),
            "px"
        ),
        createSettingCard(
            lang.BarHeightWhenClosed,
            createNumberInput(
                SettingsStore.appSettings.Size,
                "BarHeightWhenClosed",
            ),
            "px"
        ),
    ]

    createSettingSection(lang.Self, cards)
}

function createPositionSection(lang: Language["AppSettings"]["Position"]) {
    const cards: HTMLElement[] = [
        createSettingCard(
            lang.IsWindowCentered,
            createBooleanInput(
                SettingsStore.appSettings.Position,
                "IsWindowCentered",
            ),
        ),
        createSettingCard(
            lang.WindowPositionFromLeft,
            createNumberInput(
                SettingsStore.appSettings.Position,
                "WindowPositionFromLeft",
            ),
            "px"
        ),
    ]

    createSettingSection(lang.Self, cards)
}

function createDownloadSection(lang: Language["AppSettings"]["DownloadLocation"]) {
    const cards: HTMLElement[] = [
        createSettingCard(
            lang.RememberDownloadLocation,
            createBooleanInput(
                SettingsStore.appSettings.DownloadLocation,
                "RememberDownloadLocation",
            ),
        ),
        createSettingCard(
            lang.DonwloadFileLocation,
            createTextInput(
                SettingsStore.appSettings.DownloadLocation,
                "DonwloadFileLocation",
            ),
        ),
    ]

    createSettingSection(lang.Self, cards)
}

function createDurationSection(lang: Language["AppSettings"]["Duration"]) {
    const cards: HTMLElement[] = [
        createSettingCard(
            lang.WindowOpenDelay,
            createNumberInput(
                SettingsStore.appSettings.Duration,
                "WindowOpenDelay",
            ),
            "ms"
        ),
        createSettingCard(
            lang.NotificationDuration,
            createNumberInput(
                SettingsStore.appSettings.Duration,
                "NotificationDuration",
            ),
            "ms"
        ),
        createSettingCard(
            lang.TransitionDuration,
            createNumberInput(
                SettingsStore.appSettings.Duration,
                "TransitionDuration",
            ),
            "ms"
        ),
    ]

    createSettingSection(lang.Self, cards)
}

