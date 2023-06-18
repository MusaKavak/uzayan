use if_addrs::get_if_addrs;
use std::{net::UdpSocket, thread};
use tauri::{command, Window};

lazy_static! {
    static ref SOCKET: UdpSocket = UdpSocket::bind("0.0.0.0:0").unwrap();
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    address: String,
}

#[derive(Clone, serde::Serialize)]
pub struct SocketAddress {
    ip: String,
    port: u16,
    name: String,
}

#[command]
pub fn get_socket_addr() -> SocketAddress {
    let ip = get_ip_address().unwrap();
    let port = SOCKET.local_addr().unwrap().port();
    let name = whoami::devicename();
    return SocketAddress { ip, port, name };
}

fn get_ip_address() -> Result<String, ()> {
    let addresses = get_if_addrs().expect("Can't get Ip Addresses");
    for addrs in addresses {
        if !addrs.is_loopback() && addrs.ip().is_ipv4() {
            return Ok(addrs.ip().to_string());
        }
    }
    return Err(());
}

#[command]
pub fn listen_for_pair(window: Window) {
    thread::spawn(move || {
        let mut buf = [0; 200];
        let (amt, address) = SOCKET.recv_from(&mut buf).unwrap();
        let buf = &mut buf[..amt];
        let received_message = String::from_utf8(buf.to_vec()).unwrap();
        let address = address.ip().to_string();
        window
            .emit(
                "UdpMessage",
                Payload {
                    message: received_message,
                    address,
                },
            )
            .unwrap();
    });
}
