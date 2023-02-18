use tauri::command;

use if_addrs::get_if_addrs;

#[command]
pub fn get_ip_address() -> String {
    let addresses = get_if_addrs().expect("Can't get Ip Addresses");
    for addrs in addresses {
        if !addrs.is_loopback() && addrs.ip().is_ipv4() {
            return addrs.ip().to_string();
        }
    }
    String::from("")
}
