import { invoke } from "@tauri-apps/api"
import qrcode from "qrcode"
import HeaderManager from "../managers/HeaderManager"
import { listen } from "@tauri-apps/api/event"
import { NetworkMessage } from "../types/network/NetworkMessage"
import { BackendMessage } from "../types/local/BackendMessage"
import { PairRequest } from "../types/network/PairRequest"

export default class ConnectionState {
    static connectedAddress?: string

    private connectionStateContainer = document.getElementById("connection-state")
    private pairCode = "123414"

    constructor(
        private headerManager: HeaderManager
    ) {
        this.listenForPair().then(() => this.connectedToLastAddress())
    }


    async listenForPair() {
        invoke("listen_for_pair")

        await listen<BackendMessage>("UdpMessage", (message) => {
            const networkMessage = JSON.parse(message.payload.message) as NetworkMessage<PairRequest>
            if (networkMessage.event == "Pair")
                this.pair(message.payload.address, networkMessage.payload)
        })

        const udpSocketAddress = await invoke<SocketAddress>("get_socket_addr")
        this.showQrCode(udpSocketAddress)
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
        console.log(isConnected)
        if (isConnected) {
            ConnectionState.connectedAddress = address
            this.removeQrCode()
            this.headerManager.sync()
            localStorage.setItem("ConnectedAddress", address)
        }
    }

    private showQrCode(address: SocketAddress) {
        if (this.connectionStateContainer) {
            document.body.classList.add("show-connection-state")
            this.connectionStateContainer.appendChild(this.getQrCode(address))
            //TODO Add Manual Infotmation
        }
    }

    private getQrCode(address: SocketAddress): HTMLElement {
        const canvas = document.createElement("canvas")
        qrcode.toCanvas(
            canvas,
            `http://uzayan-pair?ip=${address.ip}&port=${address.port}&code=${this.pairCode}&name=${address.name}`
        )
        return canvas
    }

    private removeQrCode() {
        document.body.classList.remove("show-connection-state")
        if (this.connectionStateContainer) this.connectionStateContainer.innerHTML = ""
    }
}

type SocketAddress = {
    ip: string,
    port: number,
    name: string
}
