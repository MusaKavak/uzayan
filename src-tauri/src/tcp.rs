use std::io::{BufRead, BufReader, Write};
use std::net::TcpStream;
use std::thread;

use tauri::{command, Window};

static mut STREAM: Option<TcpStream> = None;
static mut APP: Option<Window> = None;

#[derive(Clone, serde::Serialize)]
struct Payload {
    input: String,
    address: String,
}

#[command]
pub fn connect(window: Window, address: String) -> bool {
    unsafe {
        APP = Some(window);
        match TcpStream::connect(&address) {
            Ok(stream) => {
                STREAM = Some(stream);
                listen_for_messages();
                println!("Connected To: {}", address);
                return true;
            }
            Err(_) => {
                println!("Connection Refused From: {}", address);
                return false;
            }
        };
    };
}

#[command]
pub fn emit_message(message: String) {
    unsafe {
        thread::spawn(move || match &mut STREAM {
            Some(stream) => {
                let buf = message.as_bytes();
                stream.write(buf).expect("Can't write!");
                stream.flush().expect("Can't flush");
            }
            None => println!("There is no stream avaliable!"),
        });
    };
}

unsafe fn listen_for_messages() {
    thread::spawn(|| {
        match &mut STREAM {
            Some(stream) => {
                let address = stream.peer_addr().unwrap().ip().to_string();

                let mut reader = BufReader::new(stream);
                let mut line = String::new();

                reader.read_line(&mut line).expect("Can't read the line");
                while !line.is_empty() {
                    println!("Received New Line ({})", line.len());
                    send_event(line, address.clone());
                    line = String::new();
                    reader.read_line(&mut line).expect("Can't read the line");
                }
                println!("Disconnected From Server");
            }
            None => {}
        };
    });
}

unsafe fn send_event(input: String, address: String) {
    match &APP {
        Some(window) => window
            .emit("TcpMessage", Payload { input, address })
            .unwrap(),
        None => {}
    };
}
