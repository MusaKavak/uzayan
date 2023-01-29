export class Public {
    static settings: ISettings = {
        BarWidth: 500,
        BarHeightWhenClosed: 7,
        WindowPositionFromLeft: 100,
        IsWindowOnBottom: false,
        WindowOpeningDuration: 500
    }

    static isWindowOpening = false
    static isWindowOpen = false

    static getSettingsFromLocalStorage() {
        //const string = localStorage.getItem("settings")
        //if (string != null && string.length > 10) this.settings = JSON.parse(string)
    }

    static updateSettings() {
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }

}


interface ISettings {
    BarWidth: number
    BarHeightWhenClosed: number
    WindowPositionFromLeft: number
    IsWindowOnBottom: boolean,
    WindowOpeningDuration: number
}