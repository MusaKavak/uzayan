import qrcode from "qrcode"
import { Socket } from "./Socket"

export class ConnectionState {
    connectedClients: string[] = ["192.168.1.101:34724"]
    canvas = document.getElementById("qrcode-canvas")

    constructor() {
        this.showQrCode()
        this.getConnectedClientsFromLocalStore()
        this.sendTestMessages()
    }

    getConnectedClientsFromLocalStore() {
        const string = localStorage.getItem("connectedClients")
        if (string != null && string.length > 0) {
            this.connectedClients = JSON.parse(string)
        }
    }

    sendTestMessages() {
        this.connectedClients.forEach(addr => {
            Socket.send("TestConnection", "", addr)
        })
    }

    testTheConnection(address: string) {
        if (this.connectedClients.includes(address)) {
            this.removeQrCode()
            console.log("Connected To: " + address)
        } else {

        }
    }

    removeQrCode() {
        document.body.classList.add("show-connection-state")
        this.canvas = document.createElement("canvas")
    }

    showQrCode() {
        if (this.canvas != null) {
            document.body.classList.add("show-connection-state")
            qrcode.toCanvas(this.canvas, "https://youtube.com", (err) => { console.error(err) })
        }
    }


}