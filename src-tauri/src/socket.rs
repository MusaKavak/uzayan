use std::{net::UdpSocket, thread};

use tauri::{command, Window};

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

#[command]
pub fn init_socket(window: Window) {
    println!("Initializing Socket... ");
    let socket = UdpSocket::bind("0.0.0.0:34724").expect("Couldn't bind socket to the adress");

    thread::spawn(move || loop {
        let mut buf = [0; 999999];
        let (amt, src) = socket.recv_from(&mut buf).expect("Didn't recieve data");
        let buf = &mut buf[..amt];
        let data = String::from_utf8(buf.to_vec()).expect("Can't Convert Data");
        println!("New Message From {} with {:?} data", src, data);
        window
            .emit(
                "udp",
                Payload {
                    message: String::from("EventFromUdpSocket"),
                },
            )
            .unwrap();
        socket.send_to(buf, &src).expect("Can't Send Message");
    });
}

// let buf = &mut buf[..amt];
// let data = String::from_utf8(buf.to_vec()).expect("Can't conver to string");
// println!("New Message from {} and data {:?}", src, data);

// socket.send_to(buf, &src)?;
