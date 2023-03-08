use std::{net::UdpSocket, thread};
use tauri::{command, Window};

lazy_static! {
    static ref SOCKET: UdpSocket =
        UdpSocket::bind("0.0.0.0:34724").expect("Could't bind to socket!!");
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    input: String,
    address: String,
}

#[command]
pub fn listen_socket(window: Window) {
    window
        .emit(
            "SocketPort",
            SOCKET.local_addr().unwrap().port().to_string(),
        )
        .unwrap();
    thread::spawn(move || loop {
        let mut buf = [0; 200];
        let (amt, address) = SOCKET.recv_from(&mut buf).unwrap();
        let buf = &mut buf[..amt];
        let input = String::from_utf8(buf.to_vec()).unwrap();
        let address = address.ip().to_string();
        window
            .emit("UdpMessage", Payload { input, address })
            .unwrap();
    });
}
