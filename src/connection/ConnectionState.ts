import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import OptionsManager from "../scripts/OptionsManager"
import { Socket } from "./Socket"

export class ConnectionState {
    canvas = document.getElementById("qrcode-canvas")
    pairCode = "123414"

    constructor(
        private optionsManaer: OptionsManager
    ) { }

    async sendTestMessageToLastConnectedDevice() {
        const ip = localStorage.getItem("ConnectedDeviceIp")
        const port = localStorage.getItem("ConnectedDevicePort")

        if ((ip != null && ip.length > 0)
            && (port != null && port.length > 0)) {
            if (await Socket.connect(ip, port)) {
                console.log("w")
                Socket.send("TestConnection", "")
                this.removeQrCode()
                this.optionsManaer.sync()
                console.log("Connected To: " + ip)
            }
        }

    }

    async pair(address: string, input: { port: number, code: string }) {
        if (input.code == this.pairCode) {
            if (await Socket.connect(address, input.port)) {
                setTimeout(() => {
                    Socket.send("TestConnection", null)
                }, 500);
                this.removeQrCode()
                this.optionsManaer.sync()
                localStorage.setItem("ConnectedDeviceIp", address)
                localStorage.setItem("ConnectedDevicePort", input.port.toString())
            }
        }
    }

    showQrCode(port: string) {
        if (this.canvas != null) {
            invoke("get_ip_address").then((address) => {
                document.body.classList.add("show-connection-state")
                qrcode.toCanvas(this.canvas, `http://uzayan-pair?ip=${address}&port=${port}&code=${this.pairCode}`)
            })
        }
    }

    removeQrCode() {
        document.body.classList.remove("show-connection-state")
        this.canvas?.remove()
    }
}