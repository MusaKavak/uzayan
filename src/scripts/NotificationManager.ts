import { Socket } from "../connection/Socket";
import { Notification } from "../types/Notification";
import { WindowLayoutManager } from "./WindowLayoutManager";

export default class NotificationManager {
    private container = document.getElementById("recent-notification-container")
    private notificationTab = document.getElementById("notification-tab-body")

    constructor(private windowLayoutManager: WindowLayoutManager) { }

    pushNotification(nf: Notification) {
        const element = this.createNotificationElement(nf)
        this.addToNotificationTab(element)

        const headsUp = element.cloneNode(true) as Element
        headsUp.classList.add("teporary")
        this.windowLayoutManager.openWindowForNotification()
        this.container?.appendChild(headsUp)
        this.unbounceNotification(headsUp)
    }

    syncNotifications(nfs: Notification[]) {
        if (this.notificationTab != null) {
            this.notificationTab.innerHTML = ""
            nfs.forEach(nf => {
                this.addToNotificationTab(
                    this.createNotificationElement(nf)
                )
            })
        }
    }

    addToNotificationTab(element: Element) {
        this.notificationTab?.appendChild(element)
    }

    removeNotification(key: String | null) {
        const id = "k-" + key
        document.querySelectorAll("#notification-tab-body .notification").forEach(nf => {
            if (nf.id == id) nf.remove()
        })
    }


    private unbounceNotification(element: Element) {
        setTimeout(() => element.remove(), 5000);
    }

    private createNotificationElement(nf: Notification): HTMLElement {
        const notification = this.e("notification", "k-" + nf.key)
        const notificationBody = this.e("notification-body")
        const title = this.e("notification-title")
        const text = this.e("notification-text")
        const actions = this.e("notification-actions")

        title.textContent = nf.title || "-"
        text.textContent = nf.text || "-"

        nf.actions?.forEach(a => actions.appendChild(this.createAction(a, nf.key)))

        notificationBody.appendChild(title)
        notificationBody.appendChild(text)
        notificationBody.appendChild(actions)

        if (nf.largeIcon != undefined) {
            const img = this.e("notification-large-icon", undefined, "img")
            img.setAttribute("src", "data:image/jpg;base64, " + nf.largeIcon)
            notification.appendChild(img)
        }

        notification.appendChild(notificationBody)

        return notification
    }

    private createAction(a: string, key?: string): HTMLElement {
        const action = this.e("notification-action", undefined, "button")
        action.textContent = a
        action.addEventListener("click", function () {
            console.log("Sending Action" + a + "\n from" + key)
            Socket.send("NotificationAction", { key, action: a })
        })
        return action
    }

    private e(c?: string, id?: string, type: string = "div"): HTMLElement {
        const element = document.createElement(type)
        if (c != null) element.setAttribute("class", c)
        if (id != null) element.setAttribute("id", id)
        return element
    }
}