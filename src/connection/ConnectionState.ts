import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import HeaderManager from "../managers/HeaderManager"
import { listen } from "@tauri-apps/api/event"
import { NetworkMessage } from "../types/network/NetworkMessage"
import Public from "../utils/Public"
import DialogManager from "../managers/DialogManager"
import IconProvider from "../utils/IconProvider"
import Socket from "./Socket"

export default class ConnectionState {
    static connectedAddress?: string
    static connectedDeviceName?: string
    static isConnectionSecure = false

    private pairCode = ""
    private connectionStateWrapper = document.getElementById("connection-state-wrapper")

    constructor(
        private headerManager: HeaderManager,
        private dialogManager: DialogManager
    ) {
        this.loadLastSCPreference()
        this.listenConnectionError()
        this.connectToLastServer().then((isConnected) => {
            if (!isConnected) this.initConnectionState("PairCredentials")
        })
    }

    private async initConnectionState(type: "PairCredentials" | "DeviceActions" | "Error") {
        let child: HTMLElement
        if (type == "PairCredentials") child = await this.pairCredentials()
        if (type == "DeviceActions") child = this.deviceActions()
        if (type == "Error") child = await this.connectionStateError()


        this.connectionStateWrapper!.innerHTML = "";
        this.connectionStateWrapper?.appendChild(child!)
    }

    //-----PairCredentials-----//
    private async pairCredentials(): Promise<HTMLElement> {
        const body = await this.pairCredentialsBody()
        if (!body) return this.connectionStateError()
        else
            return Public.createElement({
                clss: "connection-state type-pc",
                children: [
                    await this.secureConnectionHeader(),
                    body
                ]
            })
    }

    private async secureConnectionHeader(): Promise<HTMLElement> {
        return Public.createElement({
            id: "pc-header",
            innerHtml: ``,
            children: [
                await this.secureConnectionTitle(),
                this.secureConnectionCheckbox()
            ]
        })
    }

    private async secureConnectionTitle(): Promise<HTMLElement> {
        return Public.createElement({
            id: "pc-header-title",
            innerHtml: `<span>Secure Connection</span>`,
            children: [
                Public.createElement({
                    type: "span",
                    id: "secure-connection-info",
                    innerHtml: await IconProvider.get("information"),
                    listener: {
                        event: "click",
                        callback: () => {
                            this.dialogManager.showDialog(`
                                The secure connection encrypts your messages between devices. 
                                Therefore, the messages may be slightly larger than the insecure connection. 
                                The secure connection is a must if you DO NOT trust the network to which you're connected.
                            `, () => { })
                        }
                    }
                })
            ]
        })
    }

    private secureConnectionCheckbox(): HTMLElement {
        const checkbox = document.createElement("input")
        checkbox.checked = ConnectionState.isConnectionSecure
        checkbox.setAttribute("type", "checkbox")
        checkbox.addEventListener("change", () => {
            ConnectionState.isConnectionSecure = checkbox.checked
            localStorage.setItem("SecureConnection", checkbox.checked ? "1" : "0")
            this.initConnectionState("PairCredentials")
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

    private async pairCredentialsBody(): Promise<HTMLElement | undefined> {
        const socketAddress = await invoke<SocketAddress>("listen_for_pair")
        if (socketAddress.ip.length > 0 && socketAddress.port != 0) {
            document.body.classList.add("show-connection-state")
            this.generatePairCode()
            this.listenForPair()
            return Public.createElement({
                id: "pc-body",
                children: [
                    this.qrCode(socketAddress),
                    this.credentials(socketAddress)
                ]
            })
        } else return
    }

    private qrCode(address: SocketAddress): HTMLElement {
        const canvas = document.createElement("canvas")
        qrcode.toCanvas(
            canvas,
            `http://uzayan-pair?ip=${address.ip}&port=${address.port}&code=${this.pairCode}&secure=${ConnectionState.isConnectionSecure}`
        )
        return Public.createElement({
            id: "pc-body-qr",
            children: [canvas]
        })
    }

    private credentials(socketAddress: SocketAddress): HTMLElement {
        return Public.createElement({
            id: "pc-body-credentials",
            children: [
                this.credential("Address", socketAddress.ip),
                this.credential("Port", socketAddress.port),
                this.credential("Code", this.pairCode)
            ]
        })
    }

    private credential(title: string, value: string | number): HTMLElement {
        return Public.createElement({
            clss: "pc-credential",
            innerHtml: `
                <div class="credential-title">${title}</div>
                <div class="credential-value">${value}</div>
            `
        })
    }

    //-----DeviceActions-----//
    private deviceActions(): HTMLElement {
        document.body.classList.remove("show-connection-state")

        return Public.createElement({
            clss: "connection-state type-da",
            innerHtml: `
                <div title="Connected to: ${ConnectionState.connectedDeviceName}" id="ca-connected-device-name">${ConnectionState.connectedDeviceName}</div>
            `,
            children: [this.createDeviceActions()]
        })
    }

    private createDeviceActions(): HTMLElement | undefined {
        //TODO
        return
    }

    //-----Error-----//
    private async connectionStateError(): Promise<HTMLElement> {
        document.body.classList.add("show-connection-state")
        return Public.createElement({
            clss: "connection-state type-ce",
            children: [
                Public.createElement({
                    id: "ce-title",
                    innerHtml: `
                        <span>${await IconProvider.get("disconnected")}</span>
                        <span>An Error Occurred</span>
                    `
                }),
                Public.createElement({
                    id: "ce-refresh-button",
                    content: "Refresh",
                    listener: {
                        event: "click",
                        callback: () => { this.initConnectionState("PairCredentials") }
                    }
                })
            ]
        })
    }

    //-----Utils-----//
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
        const secure = localStorage.getItem("ConnectedDeviceSecurity")
        if (
            (address && address.length > 0) &&
            (name && name.length > 0) &&
            (secure && secure.length > 0)
        ) return this.connect(address, name, secure == "SECURE" ? true : false)
        else return false
    }

    private pair(address: string, pairRequest: PairRequest) {
        if (pairRequest.code.toString() == this.pairCode) {
            this.connect(`${address}:${pairRequest.port}`, pairRequest.name, ConnectionState.isConnectionSecure, true)
        }
    }

    private async connect(address: string, name: string, secure: boolean, showError: boolean = false): Promise<boolean> {
        const isConnected = await invoke<number>("connect", { address, secure })
        if (isConnected != 0) {
            ConnectionState.connectedAddress = address
            ConnectionState.connectedDeviceName = name
            const deviceName = await invoke<string>("get_device_name")
            Socket.send("DeviceInfo", { name: deviceName })
            this.headerManager.sync()
            localStorage.setItem("ConnectedAddress", address)
            localStorage.setItem("ConnectedDeviceName", name)
            localStorage.setItem("ConnectedDeviceSecurity", secure ? "SECURE" : "NOT")
            await this.initConnectionState("DeviceActions")
        } else if (showError) this.connectionError()

        return isConnected == 0 ? false : true
    }

    private async listenConnectionError() {
        await listen("Disconnected", () => this.connectionError())
    }

    private async connectionError() {
        ConnectionState.connectedAddress = undefined
        ConnectionState.connectedDeviceName = undefined
        await this.initConnectionState("Error")
    }

    private loadLastSCPreference() {
        const isSecure = localStorage.getItem("SecureConnection")
        if (isSecure && isSecure == "1") {
            ConnectionState.isConnectionSecure = true
        }
    }

    private generatePairCode() {
        this.pairCode = ''
        for (let i = 0; i < 6; i++) {
            this.pairCode += Math.floor(Math.random() * 10)
        }
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
    code: number,
    name: string
}