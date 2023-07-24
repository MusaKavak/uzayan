import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import HeaderManager from "../managers/HeaderManager"
import { listen } from "@tauri-apps/api/event"
import { NetworkMessage } from "../types/network/NetworkMessage"
import Public from "../utils/Public"

export default class ConnectionState {
    static connectedAddress?: string
    static connectedDeviceName?: string

    private pairCode = "123414"
    private connectionStateContainer = document.getElementById("connection-state")

    constructor(
        private headerManager: HeaderManager
    ) {
        this.listenConnectionError()
        this.connectToLastServer().then((isConnected) => {
            if (!isConnected) this.initConnectionState()
        })
    }

    private async initConnectionState() {
        const header = this.connectionStateHeader()
        const body = await this.connectionStateBody()

        this.connectionStateContainer!.innerHTML = "";

        this.connectionStateContainer?.appendChild(header)
        if (body) this.connectionStateContainer?.appendChild(body)
    }

    private async connectionStateBody(): Promise<HTMLElement | undefined> {
        if (ConnectionState.connectedAddress && ConnectionState.connectedDeviceName) {
            document.body.classList.remove("show-connection-state")
            return
        }
        else {
            const socketAddress = await invoke<SocketAddress>("listen_for_pair")
            this.listenForPair()

            document.body.classList.add("show-connection-state")

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
        if (ConnectionState.connectedAddress && ConnectionState.connectedDeviceName) {
            return Public.createElement({
                id: "connection-state-header",
            })
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
        const address = localStorage.getItem("ConnectedAddress")
        const name = localStorage.getItem("ConnectedDeviceName")
        if (
            (address && address.length > 0) &&
            (name && name.length > 0)
        ) {
            return this.connect(address, name)
        }
        return false
    }

    private pair(address: string, pairRequest: PairRequest) {
        if (pairRequest.code == this.pairCode) {
            this.connect(`${address}:${pairRequest.port}`, pairRequest.name, true)
        }
    }

    private async connect(address: string, name: string, showError: boolean = false): Promise<boolean> {
        const isConnected = await invoke<boolean>("connect", { address })
        if (isConnected) {
            ConnectionState.connectedAddress = address
            ConnectionState.connectedDeviceName = name
            this.headerManager.sync()
            document.body.classList.remove("disconnected")
            localStorage.setItem("ConnectedAddress", address)
            localStorage.setItem("ConnectedDeviceName", name)
            await this.initConnectionState()
        } else if (showError) this.connectionError()

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

    private async listenConnectionError() {
        await listen("Disconnected", () => this.connectionError())
    }

    private async connectionError() {
        ConnectionState.connectedAddress = undefined
        ConnectionState.connectedDeviceName = undefined
        document.body.classList.add("disconnected")
        await this.initConnectionState()
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