use std::net::SocketAddr;
use std::{net::UdpSocket, thread};
use tauri::{command, Window};

lazy_static! {
    static ref SOCKET: UdpSocket =
        UdpSocket::bind("0.0.0.0:34724").expect("Could't bind to socket!!");
}

#[derive(Clone, serde::Serialize)]
struct UdpMessage {
    data: String,
    address: String,
}

#[command]
pub fn listen_socket(window: Window) {
    thread::spawn(move || loop {
        let mut buf = [0; 65000];
        let (amt, address) = SOCKET.recv_from(&mut buf).expect("Didn't recieve data");
        let buf = &mut buf[..amt];
        let data = String::from_utf8(buf.to_vec()).expect("Can't Convert Data");
        println!("New Message From {} with {:?} data", address, data);
        window
            .emit(
                "udp",
                UdpMessage {
                    data,
                    address: address.to_string(),
                },
            )
            .unwrap();
    });
}

#[command]
pub fn send_message(data: String, address: String) {
    thread::spawn(move || {
        SOCKET
            .send_to(
                data.as_bytes(),
                address
                    .parse::<SocketAddr>()
                    .expect("Can't convert String to SocketAddress"),
            )
            .expect("Can't Send Message");
    });
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

// let buf = &mut buf[..amt];
// let data = String::from_utf8(buf.to_vec()).expect("Can't conver to string");
// println!("New Message from {} and data {:?}", src, data);

// socket.send_to(buf, &src)?;
