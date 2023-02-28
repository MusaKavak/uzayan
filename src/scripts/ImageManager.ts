import { ImageThumbnail } from "../types/ImageThumbnail";
import { unix, locale } from "dayjs"
import { Public } from "./Public";
import { Socket } from "../connection/Socket";
export default class ImageManager {
    imagesTab = document.getElementById("images-tab-body")
    lastDateContainer: HTMLElement | undefined
    loadMoreButton = this.getLoadMoreButton()
    lastImageIndex = 0

    constructor() {
        locale("tr")
        this.imagesTab?.appendChild(this.loadMoreButton)
    }

    setThumbnail(image: ImageThumbnail) {
        var date = this.getImageDate(image.date)
        if (image.index == 0) {
            console.log("cleaning")
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
        console.log(this.lastImageIndex)
        console.log(start)
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
        console.log("creating date container")
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
            clss: "image-thumbnail"
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
}

type ImageDate = {
    dayOfTheMonth: number,
    month: number,
    year: number,
    monthName: string,
    dayName: string,
    dayString: string
}