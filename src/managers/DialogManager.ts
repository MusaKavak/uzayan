import Public from "../utils/Public"

export default class DialogManager {
    private dialogContainer = document.getElementById("dialog-container")
    private activeDialog?: HTMLElement

    showDialog(message: string, ok: () => void) {
        this.dialogContainer?.appendChild(this.getDialog(message, ok))
    }

    showDialogWithInput(message: string, inputValue: string, ok: (value?: string) => void) {
        const input = document.createElement("input")
        input.setAttribute("type", "text")
        input.value = inputValue
        this.dialogContainer?.appendChild(this.getDialog(message, ok, input))
    }

    private getDialog(message: string, ok: (value?: string) => void, inputElement?: HTMLInputElement): HTMLElement {
        const dialog = Public.createElement({
            clss: "dialog card",
            innerHtml: `<div>${message}<s/div>`,
            children: [
                inputElement,
                this.getActions(ok, inputElement)
            ]
        })
        this.activeDialog = dialog
        return dialog
    }

    private getActions(ok: (value?: string) => void, input?: HTMLInputElement): HTMLElement {
        return Public.createElement({
            clss: "dialog-actions-wrapper",
            children: [
                Public.createElement({
                    clss: "dialog-actions",
                    children: [
                        this.getCancelButton(),
                        this.getOkButton(ok, input)
                    ]
                })
            ]
        })
    }

    private getOkButton(ok: (value?: string) => void, input?: HTMLInputElement): HTMLElement {
        return Public.createElement({
            type: "button",
            clss: "dialog-action-ok",
            content: "Ok",
            listener: {
                event: "click",
                callback: () => {
                    ok(input?.value)
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