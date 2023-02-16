import { Notification } from "../types/Notification";
import { WindowLayoutManager } from "./WindowLayoutManager";

export default class NotificationManager {
    private container = document.getElementById("recent-notification-container")
    private notificationTab = document.getElementById("notification-tab-body")

    constructor(private windowLayoutManager: WindowLayoutManager) { }

    pushNotification(nf: Notification) {
        const element = this.createNotificationElement(nf)
        this.windowLayoutManager.openWindowForNotification()
        this.container?.appendChild(element)
        this.unbounceNotification(element)

        const permanentElement = element.cloneNode(true) as Element
        permanentElement.classList.remove("temporary")
        this.notificationTab?.appendChild(permanentElement)
    }

    removeNotification(key: String | null) {
        const id = "k-" + key
        document.querySelectorAll("#notification-tab-body .notification").forEach(nf => {
            if (nf.id == id) {
                nf.remove()
            }
        })
    }

    private createNotificationElement(nf: Notification): HTMLElement {
        const largeIcon =
            nf.largeIcon != null
                ? `<img class="large-icon" src="data:image/jpg;base64, ${nf.largeIcon}"/>`
                : ''
        const element = document.createElement("div")
        element.classList.add("notification", "temporary")
        element.setAttribute("id", "k-" + nf.key)
        element.innerHTML = `
            ${largeIcon}
            <div class="notification-body" >
                <div class="notification-title">${nf.title}</div>
                <div class="notification-text">${nf.text}</div>
            </div>
        `
        return element
    }

    private unbounceNotification(element: HTMLElement) {
        setTimeout(() => {
            element.remove()
        }, 5000);

    }
}