import { readTextFile } from "@tauri-apps/api/fs";
import { Language } from "../types/local/Language";
import { join, resourceDir } from "@tauri-apps/api/path";

export async function getLanguageFile(languageCode: string): Promise<Language> {
    const path = await join(await resourceDir(), "resources", "lang", `${languageCode}.lang`)
    const string = await readTextFile(path)
    return JSON.parse(string)
}