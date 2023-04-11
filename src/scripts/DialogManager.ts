import { Public } from "./Public"

export class DialogManager {
    private dialogContainer = document.getElementById("dialog-container")
    private activeDialog?: HTMLElement

    showDialog(message: string, ok: () => void, extraElement?: HTMLElement) {
        this.dialogContainer?.appendChild(this.getDialog(message, ok, extraElement))
    }

    private getDialog(message: string, ok: () => void, extraElement?: HTMLElement): HTMLElement {
        const dialog = Public.createElement({
            clss: "dialog card",
            innerHtml: `<div>${message}<s/div>`,
            children: [
                extraElement,
                this.getActions(ok)
            ]
        })
        this.activeDialog = dialog
        return dialog
    }

    private getActions(ok: () => void): HTMLElement {
        return Public.createElement({
            clss: "dialog-actions-wrapper",
            children: [
                Public.createElement({
                    clss: "dialog-actions",
                    children: [
                        this.getCancelButton(),
                        this.getOkButton(ok)
                    ]
                })
            ]
        })
    }

    private getOkButton(ok: () => void): HTMLElement {
        return Public.createElement({
            type: "button",
            clss: "dialog-action-ok",
            content: "Ok",
            listener: {
                event: "click",
                callback: () => {
                    ok()
                    this.activeDialog?.remove()
                    this.activeDialog = undefined
                }
            }
        })
    }

    private getCancelButton(): HTMLElement {
        return Public.createElement({
            type: "button",
            clss: "dialog-action-cancel",
            content: "Cancel",
            listener: {
                event: "click",
                callback: () => {
                    this.activeDialog?.remove()
                    this.activeDialog = undefined
                }
            }
        })
    }
}