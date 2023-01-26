import { Socket } from "./connection/socket";
import "./styles/body.style.css";

async function main() {
    // Settings.getSettingsFromLocalStorage()
    //  await setWindowOnStartup()

    new Socket().inititialize()
}

window.onload = main;
