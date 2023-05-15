import { AppearanceSettings } from "../../../types/local/Settings";
import { createSettingSection } from "./ElementCreator";
import { SettingsStore } from "./SettingsStore";
import { Language } from "../../../types/local/Language";

const mainThemeCard = createThemeCard(SettingsStore.appearanceSettings)

export function createAppearanceSettings(lang: Language["Appearance"]) {
    createSettingSection(lang.Self, [
        mainThemeCard,
        ...createColorInputs(SettingsStore.appearanceSettings, lang.Variables)
    ])
}

function createThemeCard(variables: AppearanceSettings): HTMLElement {
    const body = `
            <div class="theme-card-body">
                <div class="theme-card-fonts">
                    <div class="card-font">Text Color</div>
                    <div class="card-font-faded">Faded Text Color</div>
                </div>
                <div class="theme-card-button-wrapper">
                    <button class="theme-card-button">Button</button>
                </div>
            </div>
    `

    const card = document.createElement("div")
    card.classList.add("theme-card")
    card.innerHTML = body

    for (const key in variables) {
        card.style.setProperty(key, variables[key])
    }

    return card
}

function createColorInputs(variables: AppearanceSettings, lang: Language["Appearance"]["Variables"]): HTMLElement[] {
    const inputs = []
    for (const key in variables) {
        if (key.substring(0, 5) != "--clr") continue
        let color = variables[key].substring(0, 7)
        let transparency = parseInt(variables[key].substring(7, 9), 16)
        if (isNaN(transparency)) transparency = 255
        const update = () => {
            const newColor = color + transparency.toString(16)
            mainThemeCard.style.setProperty(key, newColor)
            SettingsStore.appearanceSettings[key] = newColor
        }

        //----------------------------------//
        const colorInput = getColorInput()
        colorInput.value = color

        colorInput.oninput = () => {
            color = colorInput.value.substring(0, 7)
            update()
        }
        //----------------------------------//
        const transparencyContainer = document.createElement("div")

        const transparencyLabel = document.createElement("span")
        transparencyLabel.textContent = transparency.toString()

        const transparencyInput = getRangeInput()
        transparencyInput.value = transparency.toString()
        transparencyInput.oninput = () => {
            transparencyLabel.textContent = transparencyInput.value
            transparency = parseInt(transparencyInput.value)
            update()
        }

        transparencyContainer.appendChild(transparencyInput)
        transparencyContainer.appendChild(transparencyLabel)
        //----------------------------------//

        const container = document.createElement("div")
        container.innerHTML = `<div class="color-input-title">${lang[key]}</div>`
        container.appendChild(colorInput)
        container.appendChild(transparencyContainer)

        inputs.push(container)
    }
    return inputs
}

function getColorInput() {
    const c = document.createElement("input")
    c.setAttribute("type", "color")
    return c
}

function getRangeInput() {
    const r = document.createElement("input")
    r.setAttribute("type", "range")
    r.setAttribute("min", "0")
    r.setAttribute("max", "255")
    return r
}