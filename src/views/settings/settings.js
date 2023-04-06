const { readTextFile } = window.__TAURI__.fs
const { resolveResource } = window.__TAURI__.path

async function getResource(path) {
    const resource = await resolveResource(`resources/${path}.json`)
    const settings = await readTextFile(resource)
    return JSON.parse(settings)
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

function getTextInput(key, type) {
    const input = document.createElement("input")
    input.setAttribute("type", type)
    input.value = appSettings[key]
    console.log(input.value)
    input.addEventListener("keydown", () => {
        console.log(input.value)
    })
    return input
}

function getBooleanInput(key) {
    const label = document.createElement("label")
    label.innerHTML = '<div class="checkbox"></div>'
    const input = document.createElement("input")
    input.setAttribute("type", "checkbox")
    input.checked = appSettings[key]
    input.addEventListener("change", () => {
        console.log(input.checked)
    })
    label.appendChild(input)
    return label
}

const sctGeneral = document.getElementById("general-settings-section")
const appSettings = await getResource("settings/app.settings")
const text = await getResource("lang/en/settings.lang")


for (const key in appSettings) {
    const content = text[key]
    const type = typeof (appSettings[key])
    let input = undefined
    if (type == "number") {
        input = getTextInput(key, "number")
    }
    if (type == "boolean") {
        input = getBooleanInput(key)
    }
    sctGeneral.appendChild(createSetting(content.title, content.description, input))
}