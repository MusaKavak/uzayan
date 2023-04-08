const { readTextFile, writeTextFile } = window.__TAURI__.fs
const { resolveResource } = window.__TAURI__.path
const { appWindow } = window.__TAURI__.window
const { emit } = window.__TAURI__.event

async function getResourcePath(path) {
    return await resolveResource(`resources/${path}.json`)
}

async function getResource(path) {
    const settings = await readTextFile(await getResourcePath(path))
    return JSON.parse(settings)
}

async function writeResource(path, value) {
    await writeTextFile(await getResourcePath(path), value)
}

async function saveSettings() {
    const appSettingsString = JSON.stringify(appSettings, null, 2)
    const appearanceSettingsString = JSON.stringify(appearanceSettings, null, 2)

    document.querySelectorAll(".dirty").forEach(e => e.classList.remove("dirty"))

    await writeResource(appSettingsPath, appSettingsString)
    await writeResource(appearanceSettingsPath, appearanceSettingsString)
}

function createSetting(title, description, inputElement) {
    const element = document.createElement("div")
    const titleElement = document.createElement("div")
    const descriptionElement = document.createElement("div")

    element.classList.add("setting")
    titleElement.classList.add("setting-title")
    descriptionElement.classList.add("setting-description")

    titleElement.textContent = title
    descriptionElement.textContent = description

    element.appendChild(titleElement)
    element.appendChild(descriptionElement)
    if (inputElement)
        element.appendChild(inputElement)
    return element
}

//Inputs
function getNumberInput(key) {
    const initialValue = appSettings[key]
    const input = document.createElement("input")
    input.setAttribute("type", "number")
    input.value = initialValue
    input.addEventListener("change", () => {
        const value = parseInt(input.value)
        console.log(initialValue + "           " + input.value)
        appSettings[key] = value
        if (initialValue == value) {
            input.classList.remove("dirty")
        } else {
            input.classList.add("dirty")
        }
    })
    return input
}

function getBooleanInput(key) {
    const initialValue = appSettings[key]
    const label = document.createElement("label")
    label.innerHTML = '<div class="checkbox"></div>'
    const input = document.createElement("input")
    input.setAttribute("type", "checkbox")
    input.checked = initialValue
    input.addEventListener("change", () => {
        appSettings[key] = input.checked
        if (initialValue == input.checked) {
            input.classList.remove("dirty")
        } else {
            input.classList.add("dirty")
        }
    })
    label.appendChild(input)
    return label
}

function getColorInput(key) {
    const initialValue = appearanceSettings[key]
    const input = document.createElement("input")
    input.setAttribute("type", "color")
    input.classList.add("color-input")
    input.value = appearanceSettings[key]
    input.addEventListener("input", () => {
        appearanceSettings[key] = input.value
        if (initialValue == input.value) {
            input.classList.remove("dirty")
        } else {
            input.classList.add("dirty")
        }
    })
    return input
}

const appSettingsPath = "settings/app.settings"
const appearanceSettingsPath = "settings/apperance.settings"

const text = await getResource("lang/en/settings.lang")
const appSettings = await getResource(appSettingsPath)
const appearanceSettings = await getResource(appearanceSettingsPath)

const sctGeneral = document.getElementById("general-settings-section")
const sctAppearance = document.getElementById("appearance-settings-section")
const btnCancel = document.getElementById("btn-cancel")
const btnOk = document.getElementById("btn-ok")
const btnApply = document.getElementById("btn-apply")

btnCancel.onclick = () => {
    appWindow.close()
}

btnOk.onclick = async () => {
    await saveSettings()
    emit("reload")
    appWindow.close()
}

btnApply.onclick = async () => {
    await saveSettings()
    emit("reload")
}

for (const key in appSettings) {
    const content = text[key]
    const type = typeof (appSettings[key])
    let input = undefined
    if (type == "number") {
        input = getNumberInput(key)
    }
    if (type == "boolean") {
        input = getBooleanInput(key)
    }
    sctGeneral.appendChild(createSetting(content.title, content.description, input))
}

for (const key in appearanceSettings) {
    const content = text[key]
    let input
    if (key.substring(0, 5) == "--clr") {
        input = getColorInput(key)
    }
    sctAppearance.appendChild(createSetting(content.title, content.description, input))
}
