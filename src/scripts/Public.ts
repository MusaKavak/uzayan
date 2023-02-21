class Settings {
    constructor(
        public BarWidth: number = 500,
        public BarHeightWhenClosed: number = 8,
        public WindowPositionFromLeft: number = 100,
        public WindowOpeningDuration: number = 500,
        public WindowOpenDelay: number = 500,
        public IsWindowCentered: boolean = false,
    ) { }
}

export class Public {
    static settings: Settings = new Settings()

    static base64head = "data:image/jpg;base64, "


    static getSettingsFromLocalStorage() {
        //const string = localStorage.getItem("settings")
        //if (string != null && string.length > 10) this.settings = JSON.parse(string)
    }

    static updateSettings() {
        localStorage.setItem("settings", JSON.stringify(this.settings))
    }

    static createElement(
        specs: {
            clss?: string,
            id?: string,
            title?: string,
            type?: string,
            content?: string,
            children?: Array<HTMLElement | undefined>
            listener?: { event: string, callback: () => void }
        }
    ): HTMLElement {
        const element = document.createElement(specs.type || "div")
        if (specs.clss != undefined) element.setAttribute("class", specs.clss)
        if (specs.id != undefined) element.setAttribute("id", specs.id)
        if (specs.title != undefined) element.setAttribute("title", specs.title)
        if (specs.content != undefined) element.textContent = specs.content
        if (specs.children != undefined) specs.children.forEach(
            c => { if (c != undefined) element.appendChild(c) }
        )
        if (specs.listener != undefined) element.addEventListener(
            specs.listener.event,
            specs.listener.callback
        )
        return element
    }

}

