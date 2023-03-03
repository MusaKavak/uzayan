use std::net::SocketAddr;
use std::{net::UdpSocket, thread};
use tauri::{command, Window};

const CHUNK_SIZE: usize = 2000;

lazy_static! {
    static ref SOCKET: UdpSocket =
        UdpSocket::bind("0.0.0.0:34724").expect("Could't bind to socket!!");
}

#[command]
pub fn listen_socket(window: Window) {
    thread::spawn(move || loop {
        let mut buf = [0; CHUNK_SIZE];
        let (amt, address) = SOCKET.recv_from(&mut buf).expect("Didn't recieve data");
        let buf = &mut buf[..amt];
        window
            .emit("UdpMessage", get_message_payload(buf, address))
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
struct UdpMessagePayload {
    header: ChunkHeader,
    body: String,
    address: String,
}

#[derive(Clone, serde::Serialize)]
struct ChunkHeader {
    packet_id: String,
    count_of_chunks: String,
    current_chunk: String,
}

fn get_message_payload(arr: &[u8], address: SocketAddr) -> UdpMessagePayload {
    let mut vec = arr.to_vec();
    let mut get_value = || {
        let pos = vec
            .iter()
            .position(|&b| b == 64)
            .expect("Can't find the sperator(@)!")
            + 1;
        let mut value: Vec<u8> = Vec::new();
        for _i in 0..pos {
            value.push(vec[0]);
            vec.remove(0);
        }
        value.pop();
        return String::from_utf8(value).expect("Can't convert to string!");
    };

    let id = get_value();
    let coc = get_value();
    let cc = get_value();

    let body = String::from_utf8(vec)
        .expect("Can't convert the body to string!")
        .trim_end_matches("\u{0}")
        .to_owned();

    println!("Received the {}/{} of the Packet: {}", cc, coc, id);
    UdpMessagePayload {
        header: ChunkHeader {
            packet_id: id,
            count_of_chunks: coc,
            current_chunk: cc,
        },
        body,
        address: address.to_string(),
    }
}
