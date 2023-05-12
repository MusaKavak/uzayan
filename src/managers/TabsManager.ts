import Socket from "../connection/Socket"
import FileTabManager from "./FileManager"
import Public from "../utils/Public"

export default class TabsManager {
    private tabIcons = document.querySelectorAll(".tab")
    private tabBodies = document.querySelectorAll(".tab-body")
    private currentActive = -1

    constructor(private fileManager: FileTabManager) {
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
                    this.tabBodies[i]?.classList.remove("inactive")
                    this.currentActive = i
                } else this.currentActive = -1
            })
        })
        document.body.addEventListener("mouseleave", () => {
            if (!Public.isWindowPinned) {
                this.deactivateCurrent()
                this.currentActive = -1
            }
        })
    }

    private deactivateCurrent() {
        this.tabIcons[this.currentActive]?.classList.remove("active")
        this.tabBodies[this.currentActive]?.classList.add("inactive")
        this.fileManager.unlistenDropListener()
    }

    private invokeAction(action?: string | null) {
        switch (action) {
            case "GetNotifications": {
                Socket.send("NotificationsRequest", undefined)
                break
            }
            case "GetFiles": {
                Socket.send("FileSystemRequest", { path: "" })
                this.fileManager.setDragAndDropEvents()
                break
            }
            case "GetImages": {
                Socket.send("ImageThumbnailRequest", { start: 0, length: 10 })
                break;
            }
            default:
                break;
        }
    }

}
