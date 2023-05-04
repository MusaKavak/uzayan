import NotificationSvg from "../assets/notification.svg";
import Socket from "../connection/Socket";
import { Notification } from "../types/network/Notification";
import Public from "../utils/Public";
import WindowManager from "./WindowManager";

export default class NotificationManager {
    private svg = new NotificationSvg()

    private headsUpContainer = document.getElementById("recent-notifications-container")
    private notificationTab = document.getElementById("notifications-tab-body")

    private notifications: { [key: string]: HTMLElement } = {}
    private headsUpNotifications: { [key: string]: HTMLElement } = {}
    private groups: { [groupKey: string]: { container: HTMLElement } } = {}

    constructor(private windowManager: WindowManager) { }

    syncNotifications(nfs: Notification[]) {
        if (this.notificationTab != null) {
            this.notificationTab.innerHTML = ""
            this.notifications = {}
            this.groups = {}
            nfs.forEach(nf => this.newNotification(nf, false))
        }
    }

    newNotification(nf: Notification, headsUp: boolean) {
        const element = this.createNotificationElement(nf)
        let push = true;

        if (this.notifications[nf.key]) {
            this.notifications[nf.key].replaceWith(element)
            this.notifications[nf.key] = element
            push = false
        }
        if (this.headsUpNotifications[nf.key]) {
            this.headsUpNotifications[nf.key].replaceWith(element)
            this.headsUpNotifications[nf.key] = element
            push = false
        }

        if (push) {
            this.pushNotification(nf.key, element, nf.isGroup, nf.groupKey)
            if (headsUp) this.showHeadsUp(nf.key, element)
        }
    }

    removeNotification(key?: string) {
        if (key) {
            this.notifications[key]?.remove()
            delete this.notifications[key]
        }
    }

    private pushNotification(key: string, element: HTMLElement, isGroup: boolean, groupKey?: string) {
        this.notifications[key] = element
        if (isGroup && groupKey) {
            if (this.groups[groupKey] == undefined) {
                this.groups[groupKey] = { container: this.createGroup() }
                this.notificationTab?.appendChild(this.groups[groupKey].container)
            }
            this.groups[groupKey].container.appendChild(element)
        } else {
            this.notificationTab?.appendChild(element)
        }
    }

    private showHeadsUp(key: string, element: HTMLElement) {
        const headsUp = element.cloneNode(true) as HTMLElement
        this.headsUpNotifications[key] = headsUp
        this.windowManager.openWindowForNotification()
        this.headsUpContainer?.appendChild(headsUp)
        this.unbounceNotification(key)
    }


    private unbounceNotification(key: string) {
        setTimeout(() => {
            this.headsUpNotifications[key]?.remove()
            delete this.headsUpNotifications[key]
        }, 5000);
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
            children: [
                this.getNotificationProgress(nf.progress, nf.progressMax),
                folder,
                this.getNotificationBody(nf),
                actions
            ]
        })

        return element
    }

    private getNotificationProgress(progress?: number, progressMax?: number): HTMLElement | undefined {
        if (progress && progressMax && progressMax != 0) {
            const p = document.createElement("div")
            p.classList.add("notification-progress")
            const ratio = progress / progressMax * 100
            p.setAttribute("style", `--ratio: ${ratio}%`)
            return p
        }
        return
    }

    private getFolder(): HTMLElement {
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
                this.getNotificationTitle(nf),
                nf.bigText
                    ? Public.createElement({ clss: "notification-big-text", content: nf.bigText })
                    : Public.createElement({ clss: "notification-text", content: nf.text }),
            ]
        })
    }

    private getNotificationTitle(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "notification-title",
            children: [
                nf.smallIcon ? Public.createElement({ type: "img", src: Public.base64head + nf.smallIcon }) : undefined,
                Public.createElement({ type: "span", content: nf.title })
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