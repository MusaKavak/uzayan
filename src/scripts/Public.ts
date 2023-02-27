class Settings {
    constructor(
        public BarWidth: number = 500,
        public BarHeightWhenClosed: number = 9,
        public WindowPositionFromLeft: number = 100,
        public WindowOpeningDuration: number = 500,
        public WindowOpenDelay: number = 500,
        public IsWindowCentered: boolean = false,
        public ImageCountPerRequest: number = 10,
    ) { }
}

export class Public {
    static settings: Settings = new Settings()
    static base64head = "data:image/jpg;base64, "
    static isWindowOpen = false

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
            innerHtml?: string,
            src?: string,
            children?: Array<HTMLElement | undefined>
            listener?: { event: string, callback: () => void }
        }
    ): HTMLElement {
        const element = document.createElement(specs.type || "div")
        if (specs.clss) element.setAttribute("class", specs.clss)
        if (specs.id) element.setAttribute("id", specs.id)
        if (specs.title) element.setAttribute("title", specs.title)
        if (specs.content) element.textContent = specs.content
        if (specs.innerHtml) element.innerHTML = specs.innerHtml
        if (specs.src) element.setAttribute("src", specs.src)
        if (specs.children) specs.children.forEach(
            c => { if (c) element.appendChild(c) }
        )
        if (specs.listener) element.addEventListener(
            specs.listener.event,
            specs.listener.callback
        )
        return element
    }

}

