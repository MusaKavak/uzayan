import { Command } from "../../../types/local/Command";
import { Language } from "../../../types/local/Language";
import { getAllCommands, getCommandByName, newCommand, removeCommandByName } from "../../../utils/Commands";
import IconProvider from "../../../utils/IconProvider";
import Public from "../../../utils/Public";
import { createSettingSection } from "./ElementCreator";

export async function createCommandsSection(lang: Language['Commands']) {
    createSettingSection(
        lang.Self,
        [
            commandsHeader(lang.CommandName, lang.CommandValue),
            Public.createElement({ id: "commands-body" }),
            await newCommandRow(lang)
        ],
        "command-list-section"
    )
    await updateCommandsBody()
}


async function updateCommandsBody() {
    const removeIcon = await IconProvider.get("delete")
    const commandRows = (await getAllCommands())?.map(c => commandRow(c, removeIcon))
    document.getElementById("commands-body")?.replaceWith(Public.createElement({
        id: "commands-body",
        children: commandRows
    }))
}


function commandRow(c: Command, removeIcon: string): HTMLElement {
    return Public.createElement({
        clss: "command-row",
        innerHtml: `
            <div class="command-name">${c.name}</div>
            <div class="command-value">${c.value}</div>
        `,
        children: [
            Public.createElement({
                clss: "command-row-action",
                innerHtml: removeIcon,
                title: "Remove",
                listener: {
                    event: "click",
                    callback: async () => {
                        await removeCommandByName(c.name)
                        await updateCommandsBody()
                    }
                }
            })
        ]
    })
}

function commandsHeader(langName: string, langValue: string): HTMLElement {
    return Public.createElement({
        clss: "command-row header",
        innerHtml: `
            <div class="command-name">${langName}</div>
            <div class="command-value">${langValue}</div>
        `
    })
}

async function newCommandRow(lang: Language['Commands']): Promise<HTMLElement> {
    const iptName = document.createElement("input")
    const iptValue = document.createElement("input")
    iptName.setAttribute("type", "text")
    iptValue.setAttribute("type", "text")
    iptName.setAttribute("placeholder", lang.CommandName)
    iptValue.setAttribute("placeholder", lang.CommandValue)

    return Public.createElement({
        clss: "command-row command-new",
        children: [
            Public.createElement({ clss: "command-name", children: [iptName] }),
            Public.createElement({ clss: "command-value", children: [iptValue] }),
            Public.createElement({
                clss: "command-row-action",
                innerHtml: await IconProvider.get("add"),
                title: "Add",
                listener: {
                    event: "click",
                    callback: async () => {
                        if (iptName.value.length > 0 && iptValue.value.length > 0) {
                            if (await getCommandByName(iptName.value)) {
                                console.log("command exists")
                                //TODO Alert
                            } else {
                                await newCommand({ name: iptName.value, value: iptValue.value })
                                await updateCommandsBody()
                            }
                        }
                    }
                }
            })
        ]
    })
}