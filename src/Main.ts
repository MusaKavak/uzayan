import { Socket } from "./connection/Socket";
import { Public } from "./scripts/Public";
import { WindowLayout } from "./scripts/WindowLayout";
import "./styles/Body.style.css";
import { WindowLayoutMethods } from "./types/Callbacks";

async function Main() {
    Public.getSettingsFromLocalStorage()
    new WindowLayout(windowLayoutMethods, document.body).setWindowOnStartup()
    new Socket().inititialize()

}

var windowLayoutMethods: WindowLayoutMethods = {
    windowOpened: function () {

    },
    windowClosed: function () {

    }
}

window.onload = Main;
