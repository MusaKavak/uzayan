import { createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { Command } from "../types/local/Command";
import { appConfigDir, join } from "@tauri-apps/api/path";

export async function newCommand(command: Command) {
    const newCommands = (await getAllCommands()) || []

    newCommands.push(command)
    await writeCommands(newCommands)
}

export async function getAllCommands(): Promise<Command[] | null> {
    const configDir = await appConfigDir()

    if (!(await exists(configDir))) return null

    try {
        const commandsAsStr = await readTextFile(await join(configDir, "commands"))
        if (commandsAsStr.length > 5) {
            return JSON.parse(commandsAsStr)
        }
    } catch (e) {
        console.error(e)
    }

    return null
}

export async function getCommandByName(name: string): Promise<Command | null> {
    return (await getAllCommands())?.find(c => c.name == name) || null
}

export async function removeCommandByName(name: string) {
    const newCommands = (await getAllCommands())?.filter(c => c.name != name)
    if (newCommands) writeCommands(newCommands)
}

async function writeCommands(commands: Command[]) {
    const configDir = await appConfigDir()
    if (!(await exists(configDir))) await createDir(configDir)

    await writeTextFile(await join(configDir, "commands"), JSON.stringify(commands))
}
