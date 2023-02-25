import { Socket } from "../connection/Socket"
import { Public } from "./Public"

export class TabsManager {
    tabIcons = document.getElementById("tab-icons")?.children
    tabBody = document.getElementById("tab-body")

    constructor() {
        this.setListeners()
    }

    private setListeners() {
        const length = this.tabIcons?.length || 0
        for (let i = 0; i < length; i++) {
            const item = this.tabIcons?.item(i)
            item?.addEventListener("mouseenter", () => {
                if (this.tabIcons != undefined && Public.isWindowOpen) {
                    this.invokeAction(item.getAttribute("action"))
                    this.setClass(i)
                    this.tabBody?.classList.add("active")
                    this.tabBody?.scrollTo({
                        behavior: "smooth",
                        left: (this.tabBody?.clientWidth || 0) * i
                    })
                }
            })
        }
        document.body.addEventListener("mouseleave", () => {
            this.setClass(-1)
            this.tabBody?.classList.remove("active")
        })
    }

    private invokeAction(action?: string | null) {
        if (action == "GetNotifications") Socket.send("NotificationsRequest", "")
        if (action == "GetImages") Socket.send("ImageThumbnailRequest", { start: 0, length: 3 })
    }

    private setClass(active: number) {
        for (let i = 0; i < (this.tabIcons?.length || 0); i++) {
            if (i == active) this.tabIcons?.item(i)?.classList.add("active")
            else this.tabIcons?.item(i)?.classList.remove("active")
        }
    }
}