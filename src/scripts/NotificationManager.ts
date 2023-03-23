import NotificationSvg from "../assets/notification.svg";
import { Socket } from "../connection/Socket";
import { Notification } from "../types/Notification";
import { Public } from "./Public";
import WindowLayoutManager from "./WindowLayoutManager";

export default class NotificationManager {
    private svg = new NotificationSvg()

    private headsUpContainer = document.getElementById("recent-notifications-container")
    private notificationTab = document.getElementById("notifications-tab-body")

    private notifications: { [key: string]: HTMLElement } = {}
    private groups: { [packageName: string]: { element: HTMLElement, keys: string[] } } = {}

    constructor(private windowLayoutManager: WindowLayoutManager) { }

    syncNotifications(nfs: Notification[]) {
        if (this.notificationTab != null) {
            this.notificationTab.innerHTML = ""
            this.notifications = {}
            this.groups = {}
            nfs.forEach(nf => this.newNotification(nf, false))
        }
    }

    newNotification(nf: Notification, headsUp: boolean) {
        console.log(nf.text)
        console.log(nf.bigText)
        const element = this.createNotificationElement(nf)
        if (this.notifications[nf.key]) {
            this.notifications[nf.key].replaceWith(element)
        } else {
            this.pushNotification(nf.key, nf.isGroup || false, element, nf.packageName)
        }
        if (headsUp) this.showHeadsUp(element)
    }

    removeNotification(key?: string) {
        if (key) {
            this.notifications[key]?.remove()
            delete this.notifications[key]
        }
    }

    private pushNotification(key: string, isGroup: boolean, element: HTMLElement, packageName: string) {
        this.notifications[key] = element
        if (isGroup) {
            if (this.groups[packageName] == undefined) {
                this.groups[packageName] = { element: this.createGroup(), keys: [] }
                this.notificationTab?.appendChild(this.groups[packageName].element)
            }
            this.groups[packageName].element.appendChild(element)
            this.groups[packageName].keys.push(key)
        } else {
            this.notificationTab?.appendChild(element)
        }
    }

    private showHeadsUp(element: Element) {
        const headsUp = element.cloneNode(true) as Element
        headsUp.classList.add("headsup")
        this.windowLayoutManager.openWindowForNotification()
        this.headsUpContainer?.appendChild(headsUp)
        this.unbounceNotification(headsUp)
    }


    private unbounceNotification(element: Element) {
        setTimeout(() => element.remove(), 5000);
    }

    private createGroup(): HTMLElement {
        return Public.createElement({
            clss: "notification-group"
        })
    }

    private createNotificationElement(nf: Notification): HTMLElement {
        const actions = this.getNotificationActions(nf)
        var folder: HTMLElement | undefined
        if (actions) folder = this.getFolder()
        const element = Public.createElement({
            type: "label",
            innerHtml: actions ? this.svg.folder : "",
            clss: "notification",
            id: "notification-" + nf.key,
            children: [
                folder,
                this.getNotificationBody(nf),
                actions
            ]
        })

        return element
    }

    getFolder(): HTMLElement {
        const folder = Public.createElement({
            type: "input",
        })
        folder.setAttribute("type", "checkbox")
        return folder
    }

    private getNotificationActions(nf: Notification): HTMLElement | undefined {
        const actionList = nf.actions?.map(a => this.getAction(a, nf.key)) || []
        if (actionList.length > 0) {
            return Public.createElement({
                clss: "notification-actions",
                children: actionList
            })
        }
        return
    }

    private getAction(action?: string, key?: string): HTMLElement | undefined {
        const callback = () => {
            Socket.send("NotificationAction", { key, action })
        }
        return Public.createElement({
            clss: "notification-action",
            content: action,
            listener: {
                event: "click",
                callback
            }
        })
    }

    private getNotificationBody(nf: Notification): HTMLElement | undefined {
        return Public.createElement({
            clss: "notification-body",
            children: [
                this.getLargeIcon(nf.largeIcon),
                this.getNotificationContent(nf)
            ]
        })
    }

    private getNotificationContent(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "notification-content",
            children: [
                Public.createElement({ clss: "notification-title", content: nf.title }),
                Public.createElement({ clss: "notification-text", content: nf.text }),
                nf.bigText && nf.text != nf.bigText
                    ? Public.createElement({
                        clss: "notification-big-text",
                        content: nf.bigText
                    }) : undefined
            ]
        })
    }

    private getLargeIcon(largeIcon: string | undefined): HTMLElement | undefined {
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