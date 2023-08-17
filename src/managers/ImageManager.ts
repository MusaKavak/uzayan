import { ImageThumbnail } from "../types/network/ImageThumbnail";
import { unix } from "dayjs"
import Public from "../utils/Public";
import Socket from "../connection/Socket";
import FileTransferManager from "./FileTransferManager";

export default class ImageManager {
    imagesTab = document.getElementById("images-tab-body")
    lastDateContainer: HTMLElement | undefined
    loadMoreButton = this.getLoadMoreButton()
    lastImageIndex = 0

    constructor(private fileManager: FileTransferManager) {
        this.imagesTab?.appendChild(this.loadMoreButton)
    }

    setThumbnail(image: ImageThumbnail) {
        var date = this.getImageDate(image.date)
        console.log(image)
        if (image.index == 0) {
            this.clearImageContainer()
            this.lastDateContainer = undefined
        }
        if (
            (this.lastDateContainer?.getAttribute("date") || true)
            != (date || false)
        ) this.lastDateContainer = this.getDateContainer(date)
        this.lastDateContainer?.appendChild(this.getThumbnail(image))
        if (image.index) this.lastImageIndex = image.index
    }

    private clearImageContainer() {
        document.querySelectorAll(".image-date-container")?.forEach(c => c.remove())
    }

    private loadMore() {
        const start = this.lastImageIndex || 0
        Socket.send("ImageThumbnailRequest", { start, length: 10 })
    }

    private getLoadMoreButton(): HTMLElement {
        return Public.createElement({
            clss: "button card",
            id: "load-more-image-button",
            content: "Load More",
            listener: {
                event: "click",
                callback: this.loadMore.bind(this)
            }
        })
    }

    private getDateContainer(date: string | undefined): HTMLElement {
        const container = Public.createElement({
            clss: "image-date-container card",
            innerHtml: `<div class="date-container-header">${date}</div>`
        })
        container.setAttribute("date", date || "")
        this.loadMoreButton.insertAdjacentElement("beforebegin", container)

        return container
    }

    private getThumbnail(image: ImageThumbnail): HTMLElement {
        return Public.createElement({
            type: "img",
            src: Public.base64head + (image.value || ""),
            title: image.name,
            clss: "image-thumbnail",
            listener: {
                event: "click",
                callback: () => {
                    this.fileManager.receiveFiles([{ sourcePath: image.path, fileName: image.name }])
                }
            }
        })
    }

    private getImageDate(date?: number): string | undefined {
        if (date != undefined) {
            const imageDate = unix(date)
            imageDate.locale("tr")
            return imageDate.format("MMMM D dddd")
        }
        return
    }
}
