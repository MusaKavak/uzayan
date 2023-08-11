import { exists, readTextFile } from "@tauri-apps/api/fs"
import { join, resourceDir } from "@tauri-apps/api/path"

export default class IconProvider {
    static async get(name: string): Promise<string> {
        const iconpath = await join(await resourceDir(), "resources", `icons`, `${name}.svg`)

        if (await exists(iconpath)) {
            return await readTextFile(iconpath)
        } else {
            console.error(`The Icon:${name} Not Found!`)
            return name
        }
    }
}