import { invoke } from "@tauri-apps/api";
import ConnectionState from "../connection/ConnectionState";
import { ScreenCastOptions, Screen } from "../types/network/ScreenCastOptions";
import Public from "./Public";
import Socket from "../connection/Socket";

export async function castScreen(options: ScreenCastOptions) {
    let command = Public.settings.ScreencastCommand

    const rep = (k: string, v: string) => {
        try { command = command.replace(k, v) }
        catch (e) { console.error(e) }
    }

    rep("{screen}", options.screen)
    rep("{width}", options.width)
    rep("{height}", options.height)
    rep("{x}", options.x)
    rep("{y}", options.y)
    rep("{port}", options.port)

    const address = ConnectionState.connectedAddress!!
    rep("{host}", address.substring(0, address.lastIndexOf(":")))

    console.log(command)
}

export async function sendScreenInfo() {
    const output = await invoke<string>("run_command_and_return", { command: `xdpyinfo | grep -E "name of display| dimensions:"` })

    const lines = output.split("\n")

    const screens: Screen[] = []
    for (let i = 0; i < lines.length; i += 2) {
        if (lines[i].length < 2) break

        let dimension = lines[i + 1].replace("dimensions:", "")
        dimension = dimension.substring(
            0,
            dimension.indexOf("pixels")
        ).trim()

        const sizes = dimension.split("x")

        screens.push({
            name: lines[i].replace("name of display:", "").trim(),
            width: sizes[0],
            height: sizes[1],
        })
    }

    Socket.send("ScreenInfo", { screens })
}