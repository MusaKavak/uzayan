import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import OptionsManager from "../scripts/OptionsManager"
import { Socket } from "./Socket"

export class ConnectionState {
    connectedAddress: string | undefined
    connectetAddressPort: string | undefined
    canvas = document.getElementById("qrcode-canvas")
    pairCode = "123414"

    constructor(
        private optionsManaer: OptionsManager
    ) {
        this.getConnectedClientsFromLocalStore()
        this.sendTestMessage()
    }

    getConnectedClientsFromLocalStore() {
        const ip = localStorage.getItem("ConnectedIp")
        if (ip != null && ip.length > 0) {
            this.connectedAddress = ip
        }
        const port = localStorage.getItem("ConnectedIpPort")
        if (port != null && port.length > 0) {
            this.connectetAddressPort = port
        }
    }

    sendTestMessage() {
        if (this.connectedAddress && this.connectetAddressPort) {
            Socket.connect(this.connectedAddress, this.connectetAddressPort)
            Socket.send("TestConnection", "")
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

    pair(address: string, code: string, port: string = "34724") {
        console.log(address)
        console.log(code)
        if (code == this.pairCode) {
            Socket.connect(address, port)
            this.connectedAddress = address
            this.sendTestMessage()
            this.removeQrCode()
            localStorage.setItem("ConnectedIp", address)
            localStorage.setItem("ConnectedIpPort", port)
        }
    }

    removeQrCode() {
        document.body.classList.remove("show-connection-state")
        this.canvas?.remove()
    }

    showQrCode(port: string) {
        if (this.canvas != null) {
            invoke("get_ip_address").then((address) => {
                console.log(address)
                document.body.classList.add("show-connection-state")
                qrcode.toCanvas(this.canvas, `http://uzayan-pair?ip=${address}&port=${port}&code=${this.pairCode}`)
            })
        }
    }


}