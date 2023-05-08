import { SettingCardContent } from "../../../types/local/Language"
import Public from "../../../utils/Public"

const settingSections = document.getElementById("setting-sections")
const sectionSelectors = document.getElementById("section-selectors")

export function createSettingSection(title: string, children: HTMLElement[], id?: string) {
    const settingSection = Public.createElement({
        clss: "setting-section",
        id,
        innerHtml: `<div class="section-title">${title}</div>`,
        children
    })
    settingSections?.appendChild(settingSection)

    sectionSelectors?.appendChild(Public.createElement({
        type: "button",
        clss: "section-selector",
        content: title,
        listener: {
            event: "click",
            callback: () => settingSection.scrollIntoView({ behavior: "smooth" })
        }
    }))
}

export function createSettingCard(content: SettingCardContent, input: HTMLInputElement, valueType?: string) {
    const card = Public.createElement({
        clss: "setting-card",
        children: [
            Public.createElement({
                clss: "setting-card-content",
                children: [
                    Public.createElement({ clss: "setting-card-title", content: content.Title }),
                    Public.createElement({ clss: "setting-card-description", content: content.Description }),
                ]
            }),
            Public.createElement({
                clss: "setting-card-input",
                children: [
                    input,
                    valueType
                        ? Public.createElement({ clss: "setting-card-value-type", content: valueType })
                        : undefined,
                ]
            }),
        ]
    })

    return card
}
