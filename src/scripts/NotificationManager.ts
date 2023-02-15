import { Notification } from "../types/Notification";
import { WindowLayoutManager } from "./WindowLayoutManager";

export default class NotificationManager {
    private container = document.getElementById("recent-notification-container")

    constructor(private windowLayoutManager: WindowLayoutManager) { }

    pushNotification(nf: Notification) {
        const largeIcon = nf.largeIcon != null ? `<img class="large-icon" src="data:image/jpg;base64, ${nf.largeIcon}"/>` : ""

        const element = document.createElement("div")
        element.classList.add("notification")
        element.setAttribute("id", "k-" + nf.key)
        element.innerHTML = `
            ${largeIcon}
            <div class="notification-body" >
                <div class="notification-title">${nf.title}</div>
                <div class="notification-text">${nf.text}</div>
            </div>
        `
        this.windowLayoutManager.openWindowForNotification(this.container)
        this.container?.insertAdjacentElement("beforeend", element)
        this.unbounceNotification(element)
    }

    private unbounceNotification(element: HTMLElement) {
        setTimeout(() => {
            element.remove()
        }, 5000);

    }
}