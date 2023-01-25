use std::io::Result;
use std::net::UdpSocket;

pub fn init_socket() -> Result<()> {
    println!("Initializing Socket... ");
    let socket = UdpSocket::bind("0.0.0.0:34724").expect("Couldn't bind socket to the adress");
    listen_socket(socket);
    Ok(())
}

fn listen_socket(socket: UdpSocket) {
    loop {
        let mut buf = [0; 999999];
        let (amt, src) = socket.recv_from(&mut buf).expect("Didn't recieve data");
        let buf = &mut buf[..amt];
        let data = String::from_utf8(buf.to_vec()).expect("Can't Convert Data");
        println!("New Message From {} with {:?} data", src, data)
    }
}

// let buf = &mut buf[..amt];
// let data = String::from_utf8(buf.to_vec()).expect("Can't conver to string");
// println!("New Message from {} and data {:?}", src, data);

// socket.send_to(buf, &src)?;
