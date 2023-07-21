import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import HeaderManager from "../managers/HeaderManager"
import { listen } from "@tauri-apps/api/event"
import { NetworkMessage } from "../types/network/NetworkMessage"
import { BackendMessage } from "../types/local/BackendMessage"
import { PairRequest } from "../types/network/PairRequest"
import Public from "../utils/Public"

export default class ConnectionState {
    static connectedAddress?: string
    static connectedDevice?: string

    private pairCode = "123414"
    private connectionStateContainer = document.getElementById("connection-state")

    constructor(
        private headerManager: HeaderManager
    ) {
        this.createConnectionStateElement()
        this.listenForPair().then()
    }

    private async createConnectionStateElement() {
        const header = this.connectionStateHeader()
        const body = await this.connectionStateBody()

        this.connectionStateContainer?.appendChild(header)
        this.connectionStateContainer?.appendChild(body)
    }

    private async connectionStateBody(): Promise<HTMLElement> {
        if (ConnectionState.connectedAddress && ConnectionState.connectedDevice) {
            return Public.createElement({})
        } else {
            const socketAddress = await invoke<SocketAddress>("get_socket_addr")

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
        invoke("listen_for_pair")

        await listen<BackendMessage>("UdpMessage", (message) => {
            const networkMessage = JSON.parse(message.payload.message) as NetworkMessage<PairRequest>
            if (networkMessage.event == "Pair")
                this.pair(message.payload.address, networkMessage.payload)
        })

    }

    private async connectedToLastAddress() {
        const address = localStorage.getItem("ConnectedAddress")
        if (address && address.length > 0) this.connect(address)
    }

    private async pair(address: string, pairRequest: PairRequest) {
        if (pairRequest.code == this.pairCode) {
            await this.connect(`${address}:${pairRequest.port}`)
        }
    }

    private async connect(address: string) {
        const isConnected = await invoke<boolean>("connect", { address })
        if (isConnected) {
            ConnectionState.connectedAddress = address
            this.headerManager.sync()
            localStorage.setItem("ConnectedAddress", address)
        }
    }

    private qrCode(address: SocketAddress): HTMLElement {
        const canvas = document.createElement("canvas")
        canvas.setAttribute("id", "")
        qrcode.toCanvas(
            canvas,
            `http://uzayan-pair?ip=${address.ip}&port=${address.port}&code=${this.pairCode}&name=${address.name}`
        )
        return Public.createElement({
            id: "connection-state-body-qr",
            children: [canvas]
        })
    }
}

type SocketAddress = {
    ip: string,
    port: number,
    name: string
}