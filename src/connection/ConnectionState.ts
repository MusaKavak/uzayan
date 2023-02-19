import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import { OptionsManager } from "../scripts/OptionsManager"
import { Socket } from "./Socket"

export class ConnectionState {
    connectedAddress: string | undefined
    canvas = document.getElementById("qrcode-canvas")
    pairCode = "123414"

    constructor(
        private optionsManaer: OptionsManager
    ) {
        this.showQrCode()
        this.getConnectedClientsFromLocalStore()
        this.sendTestMessage()
    }

    getConnectedClientsFromLocalStore() {
        const string = localStorage.getItem("ConnectedIp")
        if (string != null && string.length > 0) {
            this.connectedAddress = string
        }
    }

    sendTestMessage() {
        if (this.connectedAddress != undefined) {
            Socket.send("TestConnection", "", this.connectedAddress)
        }
    }

    testTheConnection(address: string) {
        if (address == this.connectedAddress) {
            this.removeQrCode()
            this.optionsManaer.sync()
            console.log("Connected To: " + address)
        } else {
            console.log("Wrong Ip Address")
            console.log("Current: " + address + " Expected: " + this.connectedAddress)
        }
    }

    pair(address: string, code: string) {
        console.log(address)
        console.log(code)
        if (code == this.pairCode) {
            this.connectedAddress = address
            this.sendTestMessage()
            this.removeQrCode()
            localStorage.setItem("ConnectedIp", address)
        }
    }

    removeQrCode() {
        document.body.classList.remove("show-connection-state")
        this.canvas?.remove()
    }

    showQrCode() {
        if (this.canvas != null) {
            invoke("get_ip_address").then((address) => {
                console.log(address)
                document.body.classList.add("show-connection-state")
                qrcode.toCanvas(this.canvas, `http://uzayan-pair?ip=${address}&code=${this.pairCode}`)
            })
        }
    }


}