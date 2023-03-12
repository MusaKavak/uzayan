import { ImageThumbnail } from "../types/ImageThumbnail";
import { unix } from "dayjs"
import { Public } from "./Public";
import { Socket } from "../connection/Socket";
import { invoke } from "@tauri-apps/api";

export default class ImageManager {
    imagesTab = document.getElementById("images-tab-body")
    lastDateContainer: HTMLElement | undefined
    loadMoreButton = this.getLoadMoreButton()
    lastImageIndex = 0

    constructor() {
        this.imagesTab?.appendChild(this.loadMoreButton)
    }

    setThumbnail(image: ImageThumbnail) {
        var date = this.getImageDate(image.date)
        if (image.index == 0) {
            this.clearImageContainer()
            this.lastDateContainer = undefined
        }
        if (
            (this.lastDateContainer?.getAttribute("date") || true)
            != (date?.dayString || false)
        ) this.lastDateContainer = this.getDateContainer(date)
        this.lastDateContainer?.appendChild(this.getThumbnail(image))
        if (image.index) this.lastImageIndex = image.index
    }

    private clearImageContainer() {
        document.querySelectorAll(".image-date-container")?.forEach(c => c.remove())
    }

    private loadMore() {
        const start = this.lastImageIndex || 0
        Socket.send("ImageThumbnailRequest", { start, length: Public.settings.ImageCountPerRequest })
    }

    private getLoadMoreButton(): HTMLElement {
        return Public.createElement({
            id: "load-more-image-button",
            content: "Load More",
            listener: {
                event: "click",
                callback: this.loadMore.bind(this)
            }
        })
    }

    private getDateContainer(date: ImageDate | undefined): HTMLElement {
        const container = Public.createElement({
            clss: "image-date-container",
            innerHtml: `<div class="date-container-header">${date?.dayString}</div>`
        })
        container.setAttribute("date", date?.dayString || "")
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
                callback: this.getThumnailCallback(image.id, image.name)
            }
        })
    }

    private getImageDate(date?: number): ImageDate | undefined {
        if (date != undefined) {
            //The date number received from Kotlin 
            //represents the count of seconds since 1.1.1970, 
            //while JavaScript specifies time in milliseconds.
            const imageDate = unix(date)
            imageDate.locale("tr")
            return {
                dayOfTheMonth: imageDate.date(),
                month: imageDate.month(),
                year: imageDate.year(),
                monthName: imageDate.format("MMMM"),
                dayName: imageDate.format("dddd"),
                dayString: imageDate.format("MMMM D dddd")
            }
        }
        return
    }

    private getThumnailCallback(id?: String, name: String | undefined = id): () => void {
        return async () => {
            if (id == undefined) return
            const saveLocation = await Public.getDownloadFileLocation()
            if (saveLocation == undefined) return
            const message = (JSON.stringify({ message: "FullSizeImageRequest", input: { id } })) + "\n"
            invoke(
                "connect_for_large_file_transaction",
                {
                    message,
                    address: Socket.connectedServer,
                    name,
                    extension: "png",
                    saveLocation
                }
            )
        }
    }
}

type ImageDate = {
    dayOfTheMonth: number,
    month: number,
    year: number,
    monthName: string,
    dayName: string,
    dayString: string
}