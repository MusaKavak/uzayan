import NotificationSvg from "../assets/notification.svg";
import Socket from "../connection/Socket";
import { Notification } from "../types/network/Notification";
import Public from "../utils/Public";
import WindowManager from "./WindowManager";


export default class NotificationManager {

    private headsUpContainer = document.getElementById("headsup-notifications")
    private notificationTab = document.getElementById("notifications-tab-body")
    private svg = new NotificationSvg()

    constructor(private windowManager: WindowManager) { }

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
        const key = `#nf-${this.filterKey(nf.key)}`

        const notificationElement = this.createNotificationElement(nf)

        const group = this.getGroup(this.filterKey(nf.groupKey))

        const notificationToUpdate = group.querySelector(key)
        if (notificationToUpdate) notificationToUpdate.replaceWith(notificationElement)
        else {
            group.appendChild(notificationElement)
            if (headsUp) this.showHeadsUp(nf)
        }
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
            type: "label",
            clss: "notification",
            id: `nf-${this.filterKey(nf.key)}`,
            innerHtml: '<input type="checkbox" class="notification-folder"/>',
            children: [
                this.notificationBody(nf),
                this.notificationActions(nf.key, nf.actions)
            ]
        })
        newNotification.setAttribute("tabindex", "0")
        return newNotification
    }

    private notificationActions(key: string, actions?: string[]): HTMLElement | undefined {
        if (actions && actions.length > 0) {
            return Public.createElement({
                clss: "notification-actions",
                children: actions.map(a =>
                    a.substring(0, 7) == "*REPLY*" ? this.replyAction(key, a) : this.action(key, a)
                )
            })
        }
        return
    }

    private action(key: string, action: string): HTMLElement {
        return Public.createElement({
            clss: "notification-action",
            content: action,
            listener: {
                event: "click",
                callback: () => {
                    Socket.send("NotificationAction", { key, action, input: "" })
                }
            }
        })
    }

    private replyAction(key: string, action: string): HTMLElement {
        const input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("class", "notification-reply-input")
        input.setAttribute("placeholder", action.substring(7))
        input.required = true
        return Public.createElement({
            clss: "notification-reply-action",
            children: [
                input,
                Public.createElement({
                    clss: "notification-reply-send",
                    //TODO Change It To Icon
                    innerHtml: this.svg.send,
                    listener: {
                        event: "click",
                        callback: () => {
                            if (input.validity.valid)
                                Socket.send("NotificationAction", { key, action, input: input.value })
                        }
                    }
                })
            ]

        })

    }

    private notificationBody(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "notification-body",
            children: [
                this.notificationLargeIcon(nf.largeIcon),
                this.notificationContent(nf)
            ]
        })
    }

    private notificationContent(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "notification-content",
            children: [
                this.notificationTitle(nf.title),
                this.notificationText(nf.text, nf.bigText)
            ]
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

    private notificationText(text?: string, bigText?: string): HTMLElement | undefined {
        if (!text && !bigText) return

        if (text && bigText && text == bigText.substring(0, text.length)) text = undefined

        return Public.createElement({
            clss: "notification-text",
            innerHtml: `
            <div>${text ? text : ""}</div>
            <div>${bigText ? bigText : ""}<div>
            `
        })
    }

    private notificationLargeIcon(largeIcon?: string): HTMLElement | undefined {
        if (largeIcon) {
            const img = document.createElement("img")
            img.setAttribute("src", Public.base64head + largeIcon)
            return img
        }
        return
    }

    private showHeadsUp(nf: Notification) {
        const selector = `#hunf-${this.filterKey(nf.key)}`
        const element = this.createHeadsUpNotification(nf)


        const contains = this.headsUpContainer?.querySelector(selector)

        if (!contains) {
            this.headsUpContainer?.appendChild(element)
            setTimeout(() => element.classList.add("bounce"), 1)
            this.windowManager.bounceNotification()
        }

        setTimeout(() => {
            element.classList.remove("bounce")
            setTimeout(() => {
                element.remove()
                this.windowManager.unbounceNotification()
            }, Public.settings.Duration.TransitionDuration);
        }, Public.settings.Duration.NotificationDuration);
    }

    private createHeadsUpNotification(nf: Notification): HTMLElement {
        return Public.createElement({
            clss: "headsup-notification",
            id: `hunf-${this.filterKey(nf.key)}`,
            children: [
                this.notificationLargeIcon(nf.largeIcon),
                this.notificationTitle(nf.title || nf.text || nf.bigText)
            ]
        })
    }

    private filterKey(key: string): string {
        return key.replace(/[^a-zA-Z0-9]/g, '');
    }
}
