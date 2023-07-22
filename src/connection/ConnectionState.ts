import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import HeaderManager from "../managers/HeaderManager"
import { listen } from "@tauri-apps/api/event"
import { NetworkMessage } from "../types/network/NetworkMessage"
import Public from "../utils/Public"

export default class ConnectionState {
    static connectedAddress?: string
    static connectedDevice?: string

    private pairCode = "123414"
    private connectionStateContainer = document.getElementById("connection-state")

    constructor(
        private headerManager: HeaderManager
    ) {
        this.initConnectionState()
    }

    private async initConnectionState() {
        if (await this.connectToLastServer()) return
        const header = this.connectionStateHeader()
        const body = await this.connectionStateBody()

        this.connectionStateContainer?.appendChild(header)
        this.connectionStateContainer?.appendChild(body)
    }

    private async connectionStateBody(): Promise<HTMLElement> {
        if (ConnectionState.connectedAddress && ConnectionState.connectedDevice) {
            return Public.createElement({})
        } else {
            const socketAddress = await invoke<SocketAddress>("listen_for_pair")
            this.listenForPair()
            return Public.createElement({
                id: "connection-state-body",
                children: [
                    this.qrCode(socketAddress),
                    this.credentials(socketAddress)
                ]
            })
        }
    }

    private credentials(socketAddress: SocketAddress): HTMLElement {
        return Public.createElement({
            id: "connection-state-body-credentials",
            children: [
                this.credential("Address", socketAddress.ip),
                this.credential("Port", socketAddress.port),
                this.credential("Code", this.pairCode)
            ]
        })
    }

    private credential(title: string, value: string | number): HTMLElement {
        return Public.createElement({
            clss: "credential",
            innerHtml: `
                <div class="credential-title">${title}</div>
                <div class="credential-value">${value}</div>
            `
        })
    }

    private connectionStateHeader(): HTMLElement {
        if (ConnectionState.connectedAddress && ConnectionState.connectedDevice) {
            return Public.createElement({})
        } else {
            return Public.createElement({
                id: "connection-state-header",
                innerHtml: `<span>Enable Secure Connection</span>`,
                children: [this.secureConnectionCheckbox()]
            })
        }
    }

    private secureConnectionCheckbox(): HTMLElement {
        const checkbox = document.createElement("input")
        checkbox.setAttribute("type", "checkbox")
        checkbox.addEventListener("change", () => {
            console.log(checkbox.checked)
        })

        return Public.createElement({
            type: "label",
            clss: "switch",
            id: "secure-connection-checkbox",
            children: [
                checkbox,
                document.createElement("div")
            ]
        })
    }

    async listenForPair() {
        const unlisten = await listen<UdpMessage>("UdpMessage", (udp) => {
            console.log(udp)
            if (udp.payload.message == "!!!!!Error") {
                this.connectionError()
                return
            }

            const networkMessage = JSON.parse(udp.payload.message) as NetworkMessage<PairRequest>
            if (networkMessage.event == "Pair")
                this.pair(udp.payload.address, networkMessage.payload)
            unlisten()
        })

    }

    private async connectToLastServer(): Promise<boolean> {
        const address = localStorage.getItem("ConnedtedServer")
        if (address && address.length > 0) return this.connect(address)
        return false
    }

    private pair(address: string, pairRequest: PairRequest) {
        if (pairRequest.code == this.pairCode) {
            this.connect(`${address}:${pairRequest.port}`)
        }
    }

    private async connect(address: string): Promise<boolean> {
        const isConnected = await invoke<boolean>("connect", { address })
        if (isConnected) {
            ConnectionState.connectedAddress = address
            this.headerManager.sync()
            localStorage.setItem("ConnedtedServer", address)
        } else this.connectionError()

        return isConnected
    }

    private qrCode(address: SocketAddress): HTMLElement {
        const canvas = document.createElement("canvas")
        qrcode.toCanvas(
            canvas,
            `http://uzayan-pair?ip=${address.ip}&port=${address.port}&code=${this.pairCode}`
        )
        return Public.createElement({
            id: "connection-state-body-qr",
            children: [canvas]
        })
    }

    private connectionError() {
        console.log("!!!!!!!!Connection!!!!!!!!")
    }
}

type UdpMessage = {
    message: string,
    address: string
}

type SocketAddress = {
    ip: string,
    port: number,
}

type PairRequest = {
    port: number,
    code: string,
    name: string
}