import { invoke, os } from "@tauri-apps/api";
import ConnectionState from "../connection/ConnectionState";
import { ScreenCastOptions, Screen } from "../types/network/ScreenCastOptions";
import Public from "./Public";
import Socket from "../connection/Socket";
import { appWindow } from "@tauri-apps/api/window";

export async function startScreencast(options: ScreenCastOptions) {
    let command = Public.settings.ScreencastCommand.trim()

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


    await invoke("start_screencast", { command })
}

export async function stopScreencast() {
    console.log(await appWindow.emit("stop_screencast"))
}

export async function sendScreenInfo() {
    const osName = await os.type()

    if (osName == "Linux") sendScreenInfoLinux(osName)
    if (osName == "Windows_NT") sendScreenInfoWindows()
}

async function sendScreenInfoWindows() {
    //TODO Change Example
    Socket.send("ScreenInfo", { screens: [{ name: "Main", width: "1920", height: "1080" }] })
}

async function sendScreenInfoLinux(osName: string) {
    const output = await invoke<string>("run_command", { os: osName, command: `xdpyinfo | grep -E "name of display| dimensions:"` })

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