use if_addrs::get_if_addrs;
use std::{net::UdpSocket, thread};
use tauri::{command, Window};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    address: String,
}

#[derive(Clone, serde::Serialize)]
pub struct SocketAddress {
    ip: String,
    port: u16,
}

#[command]
pub fn listen_for_pair(window: Window) -> SocketAddress {
    let mut _error = String::new();

    match get_ip_address() {
        Ok(ip) => {
            println!("LocalIp:{}", ip);
            match UdpSocket::bind(ip.clone() + ":0") {
                Ok(socket) => {
                    let port = socket.local_addr().unwrap().port();
                    println!("{}:{}", ip, port);
                    thread::spawn(move || {
                        listen(window, socket);
                    });

                    return SocketAddress { ip, port };
                }
                Err(e) => {
                    _error = format!("Error While Udp Binding:\n {}", e.to_string());
                }
            };
        }
        Err(e) => {
            _error = format!("Error While Getting Ip:\n {}", e.to_string());
        }
    }

    if !_error.is_empty() {
        println!("{}", _error);
    }

    return SocketAddress {
        ip: "".to_string(),
        port: 0,
    };
}

fn listen(window: Window, socket: UdpSocket) {
    let mut buf = [0; 200];
    match socket.recv_from(&mut buf) {
        Ok((amt, address)) => {
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
        }
        Err(e) => {
            println!("Error While Receiving Udp Message:\n{}", e.to_string());
            window
                .emit(
                    "UdpMessage",
                    Payload {
                        message: "!!!!!Error".to_string(),
                        address: "".to_string(),
                    },
                )
                .unwrap();
        }
    };
}

fn get_ip_address() -> Result<String, String> {
    if let Ok(addresses) = get_if_addrs() {
        for addrs in addresses {
            if !addrs.is_loopback() && addrs.ip().is_ipv4() {
                return Ok(addrs.ip().to_string());
            }
        }
    }
    return Err("Couln't Find Suitable Ip Address".to_string());
}
