import ConnectionState from "../connection/ConnectionState";
import { ScreenCastOptions } from "../types/network/ScreenCastOptions";
import Public from "./Public";

export async function castScreen(options: ScreenCastOptions) {
    let command = Public.settings.ScreencastCommand

    const rep = (k: string, v: string) => {
        try { command = command.replace(k, v) }
        catch (e) { console.error(e) }
    }

    rep("{width}", options.width)
    rep("{height}", options.height)
    rep("{x}", options.x)
    rep("{y}", options.y)
    rep("{framerate}", options.framerate)
    rep("{port}", options.port)
    rep("{host}", ConnectionState.connectedAddress!!)

    console.log(command)
} 