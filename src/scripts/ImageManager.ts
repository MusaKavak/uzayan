import { ImageThumbnail } from "../types/ImageThumbnail";
import { unix, locale } from "dayjs"
import { Public } from "./Public";
export class ImageManager {
    imagesTab = document.getElementById("images-tab-body")
    lastDateContainer: HTMLElement | undefined

    constructor() {
        locale("tr")
        this.imagesTab?.addEventListener("scroll", (e) => {
            console.log(this.imagesTab?.scrollHeight)
            console.log(this.imagesTab?.scrollTop)
        })
    }

    setThumbnail(image: ImageThumbnail) {
        var date = this.getImageDate(image.date)
        if (image.index == 0 && this.imagesTab != undefined) {
            console.log("cleaning")
            this.imagesTab.innerHTML = ""
            this.lastDateContainer = undefined
        }
        if (
            (this.lastDateContainer?.getAttribute("date") || true)
            != (date?.dayString || false)
        ) this.lastDateContainer = this.getDateContainer(date)
        this.lastDateContainer?.appendChild(this.getThumbnail(image))
    }

    private getDateContainer(date: ImageDate | undefined): HTMLElement {
        console.log("creating date container")
        const container = Public.createElement({
            clss: "image-date-container",
            innerHtml: `<div class="date-container-header">${date?.dayString}</div>`
        })
        container.setAttribute("date", date?.dayString || "")
        this.imagesTab?.appendChild(container)

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