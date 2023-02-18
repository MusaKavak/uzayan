import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import { OptionsManager } from "../scripts/OptionsManager"
import { Socket } from "./Socket"

export class ConnectionState {
    connectedAddress: string = "192.168.1.101:34724"
    canvas = document.getElementById("qrcode-canvas")

    constructor(
        private optionsManaer: OptionsManager
    ) {
        this.showQrCode()
        this.getConnectedClientsFromLocalStore()
        this.sendTestMessages()
    }

    getConnectedClientsFromLocalStore() {
        const string = localStorage.getItem("connectedClient")
        if (string != null && string.length > 0) {
            this.connectedAddress = string
        }
    }

    sendTestMessages() {
        Socket.send("TestConnection", "", this.connectedAddress)
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

    removeQrCode() {
        document.body.classList.remove("show-connection-state")
        this.canvas = document.createElement("canvas")
    }

    showQrCode() {
        if (this.canvas != null) {
            invoke("get_ip_address").then((address) => {
                console.log(address)
                document.body.classList.add("show-connection-state")
                qrcode.toCanvas(this.canvas, address + ":34724")
            })
        }
    }


}