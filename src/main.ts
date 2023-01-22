import { setWindowOnStartup } from "./scripts/windowLayout";
import "./styles/body.style.css";

window.onload = () => main();

async function main() {
    await setWindowOnStartup()
}