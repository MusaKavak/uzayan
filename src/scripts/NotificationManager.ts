import { Socket } from "../connection/Socket";
import { Notification } from "../types/Notification";
import { Public } from "./Public";
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
        return Public.createElement({
            clss: "notification",
            id: "notification-" + nf.key,
            children: [
                this.getLargeIcon(nf.largeIcon),
                this.getNotificationBody(nf),
                this.getNotificationActions(nf),
            ]
        })
    }
    getNotificationActions(nf: Notification): HTMLElement | undefined {
        const actionList = nf.actions?.map(a => this.getAction(a, nf.key))
        return Public.createElement({
            clss: "notification-actions",
            children: actionList
        })
    }

    private getAction(action?: string, key?: string): HTMLElement | undefined {
        const callback = () => {
            console.log("Sending Action" + action + "\n from" + key)
            Socket.send("NotificationAction", { key, action })
        }
        return Public.createElement({
            clss: "notification-action",
            type: "button",
            content: action,
            listener: {
                event: "click",
                callback
            }
        })
    }

    getNotificationBody(nf: Notification): HTMLElement | undefined {
        return Public.createElement({
            clss: "notification-body",
            children: [
                Public.createElement({ clss: "notification-title", content: nf.title }),
                Public.createElement({ clss: "notification-text", content: nf.text })
            ]
        })
    }

    getLargeIcon(largeIcon: string | undefined): HTMLElement | undefined {
        if (largeIcon != undefined) {
            const icon = Public.createElement({
                clss: "notification-large-icon",
                type: "img"
            })
            icon.setAttribute("src", largeIcon ? Public.base64head + largeIcon : "")
            return icon
        }
        return
    }
}