import { Socket } from "./connection/Socket";
import { Public } from "./scripts/Public";
import { setWindowOnStartup } from "./scripts/WindowLayout";
import "./styles/Body.style.css";

async function Main() {
    Public.getSettingsFromLocalStorage()
    setWindowOnStartup()

    new Socket().inititialize()
}

window.onload = Main;
