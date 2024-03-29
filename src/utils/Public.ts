import { AppSettings } from "../types/local/Settings"

export default class Public {
    static settings: AppSettings
    static base64head = "data:image/webp;base64, "
    static isWindowOpen = false
    static isWindowPinned = false

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

