import { SettingsStore } from "./SettingsStore";


export function createTextInput<T extends Record<K, string>, K extends keyof T>(target: T, key: K): HTMLInputElement {
    const input = document.createElement("input")
    input.setAttribute("type", "text")
    input.value = target[key]

    input.onchange = () => {
        if (input.validity.valid) {
            target[key] = input.value as T[K]
        }
    }

    return input
}
export function createNumberInput<T extends Record<K, number>, K extends keyof T>(target: T, key: K): HTMLInputElement {
    const input = document.createElement("input")
    input.value = target[key].toString()
    input.setAttribute("type", "text")
    input.setAttribute("pattern", "[0-9]+")

    input.onchange = () => {
        if (input.validity.valid) {
            const value = parseInt(input.value)
            if (isNaN(value)) return
            console.log(SettingsStore.appSettings)
            target[key] = value as T[K]
        }
    }

    return input
}

export function createBooleanInput<T extends Record<K, boolean>, K extends keyof T>(target: T, key: K): HTMLInputElement {
    const input = document.createElement("input")
    input.checked = target[key]
    input.setAttribute("type", "checkbox")

    input.onchange = () => {
        target[key] = input.checked as T[K]
    }

    return input
}

export function createColorInput<T extends Record<K, string>, K extends keyof T>(target: T, key: K, name: string): HTMLElement {
    const container = document.createElement("div")
    container.classList.add("color-input")
    container.innerHTML = `<div>${name}</div>`

    const input = document.createElement("input")
    input.value = target[key]
    input.setAttribute("type", "color")

    input.onchange = () => {
        target[key] = input.value as T[K]
    }

    container.appendChild(input)
    return container
}
