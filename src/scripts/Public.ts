class Settings {
    constructor(
        public BarWidth: number = 500,
        public BarHeightWhenClosed: number = 7,
        public WindowPositionFromLeft: number = 100,
        public WindowOpeningDuration: number = 500,
        public IsWindowCentered: boolean = false,
    ) { }
}

export class Public {
    static settings: Settings = new Settings()


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

