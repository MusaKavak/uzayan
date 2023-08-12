import { WebviewWindow, appWindow } from "@tauri-apps/api/window"
import Socket from "../connection/Socket"
import { listen } from "@tauri-apps/api/event"
import Public from "../utils/Public"
import IconProvider from "../utils/IconProvider"

export default class HeaderManager {
    private subHeader = document.getElementById("sub-header")

    constructor() {
        this.setSubHeader()
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

    private async setSubHeader() {
        if (!this.subHeader) return
        this.subHeader.appendChild(await this.getAppIcon())
        this.subHeader.appendChild(await this.getActions())
    }

    private async getActions(): Promise<HTMLElement> {
        return Public.createElement({
            id: "header-actions",
            children: [
                await this.getSettingsButton(),
                await this.getPinButton(),
                await this.getReloadButton(),
                await this.getCloseButton()
            ]
        })
    }

    private async getCloseButton(): Promise<HTMLElement> {
        return Public.createElement({
            innerHtml: await IconProvider.get("close"),
            title: "Close",
            listener: {
                event: "click",
                callback: () => {
                    appWindow.close()
                }
            }
        })
    }

    private async getSettingsButton(): Promise<HTMLElement> {
        return Public.createElement({
            innerHtml: await IconProvider.get("settings"),
            title: "Settings",
            listener: {
                event: "click",
                callback: () => {
                    new WebviewWindow("settings", {
                        url: './src/views/settings/settings.html',
                        title: "Uzayan - Settings",
                        minWidth: 500,
                        minHeight: 500,
                        height: 600,
                        width: 900,
                        transparent: true,
                    })
                }
            }
        })
    }

    private async getReloadButton(): Promise<HTMLElement> {
        return Public.createElement({
            innerHtml: await IconProvider.get("reload"),
            title: "Reload",
            listener: {
                event: "click",
                callback: () => {
                    this.reloadWindow()
                }
            }
        })
    }

    private async getPinButton(): Promise<HTMLElement> {
        return Public.createElement({
            id: "header-action-pin",
            innerHtml: await IconProvider.get("pin"),
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

    private async getAppIcon(): Promise<HTMLElement> {
        return Public.createElement({
            id: "header-icon",
            title: "Uzayan",
            innerHtml: await IconProvider.get("app"),
            listener: {
                "event": "click",
                "callback": () => {
                    document.body.classList.toggle("show-connection-state")
                }
            }
        })
    }
}