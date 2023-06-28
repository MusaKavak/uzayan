import { Notification } from "../types/network/Notification";
import Public from "../utils/Public";


export default class NotificationManager {

    private body = document.getElementById("body")
    private headsUpContainer = document.getElementById("recent-notifications-container")
    private notificationTab = document.getElementById("notifications-tab-body")


    syncNotifications(notifications: Notification[]) {
        if (this.notificationTab) this.notificationTab.innerHTML = ""
        notifications.forEach(nf => this.createNotification(nf, false))
    }

    removeNotification(nf: Notification) {
        const group = this.getGroup(this.filterKey(nf.groupKey))

        const nfToRemove = group.querySelector(`#nf-${this.filterKey(nf.key)}`)
        nfToRemove?.remove()

        if (group.querySelectorAll(".notification").length == 0) {
            group.remove()
        }
    }

    createNotification(nf: Notification, headsUp: boolean) {
        const notificationElement = this.createNotificationElement(nf)
        const group = this.getGroup(this.filterKey(nf.groupKey))
        console.log(`#nf-${nf.key}`)
        const notificationToUpdate = group.querySelector(`#nf-${this.filterKey(nf.key)}`)
        if (notificationToUpdate) notificationToUpdate.replaceWith(notificationElement)
        else group.appendChild(notificationElement)
    }

    private getGroup(groupKey: string): HTMLElement {
        const group = document.getElementById(`nfgrp-${this.filterKey(groupKey)}`)
        if (group) return group

        const newGroup = Public.createElement({ clss: "notification-group", id: `nfgrp-${this.filterKey(groupKey)}` })
        this.notificationTab?.appendChild(newGroup)
        return newGroup
    }

    private createNotificationElement(nf: Notification): HTMLElement {
        const newNotification = Public.createElement({
            clss: "notification",
            id: `nf-${this.filterKey(nf.key)}`,
            innerHtml: '<label class="notification-folder"><input type="checkbox"/></label>',
            children: [
                this.notificationLargeIcon(nf.largeIcon),
                this.notificationBody(nf)
            ]
        })

        return newNotification
    }

    private notificationBody(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "notification-body",
            children: [
                this.notificationTitle(nf.title),
            ].concat(this.notificationText())
        })
    }

    private notificationTitle(title?: string): HTMLElement | undefined {
        if (title) {
            return Public.createElement({
                clss: "notification-title",
                content: title
            })
        }
        return
    }

    private notificationText(text?: string, bigText?: string): HTMLElement[] | undefined {
        const eText = () => Public.createElement({ clss: "notification-text", content: text })
        const eBigText = () => Public.createElement({ clss: "notification-bigtext", content: bigText })

        if (text) {
            if (bigText) {
                if (text == bigText.substring(0, text.length)) return [eBigText()]
                else[eText(), eBigText()]
            }
            return [eText()]
        }
        return
    }

    private notificationLargeIcon(largeIcon?: string): HTMLElement | undefined {
        if (largeIcon) {
            const img = document.createElement("img")
            img.setAttribute("src", Public.base64head + largeIcon)
            return img
        }
        return
    }

    private filterKey(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '');
    }
}