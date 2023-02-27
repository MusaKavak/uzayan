import { Socket } from "../connection/Socket"

export class TabsManager {
    private tabIcons = document.querySelectorAll(".tab")
    private tabBodies = document.querySelectorAll(".tab-body")
    private currentActive = -1

    constructor() {
        this.setListeners()
    }

    private setListeners() {
        this.tabIcons.forEach((t, i) => {
            t.addEventListener("click", () => {
                this.deactivateCurrent()
                //If it is already active, deactivate the tab.
                if (this.currentActive != i) {
                    this.invokeAction(t.getAttribute("action"))
                    t.classList.add("active")
                    this.tabBodies[i]?.classList.add("active")
                    this.currentActive = i
                } else this.currentActive = -1
            })
        })
        document.body.addEventListener("mouseleave", () => { this.deactivateCurrent(); this.currentActive = -1 })
    }

    private deactivateCurrent() {
        this.tabIcons[this.currentActive]?.classList.remove("active")
        this.tabBodies[this.currentActive]?.classList.remove("active")
    }

    private invokeAction(action?: string | null) {
        if (action == "GetNotifications") Socket.send("NotificationsRequest", "")
        if (action == "GetImages") Socket.send("ImageThumbnailRequest", { start: 0, length: 10 })
    }

}