import { WebviewWindow, appWindow } from "@tauri-apps/api/window"
import Socket from "../connection/Socket"
import { listen } from "@tauri-apps/api/event"
import Public from "../utils/Public"
import { HeaderSvg } from "../assets/header.svg"

export default class HeaderManager {
    private svg = new HeaderSvg()
    private headerContainer = document.getElementById("header-container")

    constructor() {
        this.setHeader()
        this.setListeners()
    }

    private async setListeners() {
        await listen("reload", () => this.reloadWindow())
    }

    sync() {
        Socket.send("MediaSessionsRequest", "")
    }

    private reloadWindow() {
        localStorage.setItem("OpenWindowOnStart", "1")
        location.reload()
    }

    private setHeader() {
        if (!this.headerContainer) return
        this.headerContainer.appendChild(this.getAppIcon())
        this.headerContainer.appendChild(this.getActions())
    }

    private getActions(): HTMLElement {
        return Public.createElement({
            id: "header-actions",
            children: [
                this.getSettingsButton(),
                this.getPinButton(),
                this.getReloadButton(),
                this.getCloseButton()
            ]
        })
    }

    private getCloseButton(): HTMLElement {
        return Public.createElement({
            innerHtml: this.svg.close,
            title: "Close",
            listener: {
                event: "click",
                callback: () => {
                    appWindow.close()
                }
            }
        })
    }

    private getSettingsButton(): HTMLElement {
        return Public.createElement({
            innerHtml: this.svg.settings,
            title: "Settings",
            listener: {
                event: "click",
                callback: () => {
                    new WebviewWindow("settings", {
                        url: './src/views/settings/settings.html',
                        title: "Uzayan - Settings",
                        minWidth: 500,
                        minHeight: 500
                    })
                }
            }
        })
    }

    private getReloadButton(): HTMLElement {
        return Public.createElement({
            innerHtml: this.svg.reload,
            title: "Reload",
            listener: {
                event: "click",
                callback: () => {
                    this.reloadWindow()
                }
            }
        })
    }

    private getPinButton(): HTMLElement {
        return Public.createElement({
            id: "header-action-pin",
            innerHtml: this.svg.pin,
            title: "Pin",
            listener: {
                event: "click",
                callback: () => {
                    if (Public.isWindowPinned) {
                        document.body.classList.remove("pinned")
                        Public.isWindowPinned = false
                    } else {
                        document.body.classList.add("pinned")
                        Public.isWindowPinned = true
                    }
                }
            }
        })
    }

    private getAppIcon(): HTMLElement {
        return Public.createElement({
            id: "header-icon",
            title: "Uzayan",
            innerHtml: this.svg.appIcon
        })
    }
}