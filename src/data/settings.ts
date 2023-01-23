export class Settings {
    static settings: ISettings = {
        BarWidth: 500,
        BarHeightWhenClosed: 7,
        WindowPositionFromLeft: 100,
        IsWindowOnBottom: false
    }

    static getSettingsFromLocalStorage() {
        const settingsFromStorage = JSON.parse(localStorage.getItem("settings") || "") as ISettings | undefined
        console.log(settingsFromStorage)

        if (settingsFromStorage != undefined) {
            this.settings = settingsFromStorage
            console.log(this.settings)
        }
    }

    static updateSettings() {
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }
}

interface ISettings {
    BarWidth: number
    BarHeightWhenClosed: number
    WindowPositionFromLeft: number
    IsWindowOnBottom: boolean
}