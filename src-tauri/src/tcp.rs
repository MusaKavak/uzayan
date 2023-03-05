use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};

use tauri::{command, Window};

static mut STREAM: Option<TcpStream> = None;

lazy_static! {
    static ref LISTENER: TcpListener =
        TcpListener::bind("0.0.0.0:34724").expect("Can't Bind The Listener");
}

#[command]
pub fn connect(address: String) {
    unsafe {
        let stream = TcpStream::connect(address).expect("Can't Connect");
        stream
            .set_nonblocking(true)
            .expect("set_nonblocking call failed");
        STREAM = Some(stream);
    };
}

#[command]
pub fn emit_message(message: String) {
    unsafe {
        match &mut STREAM {
            Some(stream) => {
                let buf = message.as_bytes();
                stream.write(buf).expect("Can't write!");
                stream.flush().expect("Can't flush");
            }
            None => println!("There is no stream avaliable!"),
        }
    }
}

#[command]
pub fn listen_for_connections(window: Window) {
    for stream in LISTENER.incoming() {
        match stream {
            Ok(stream) => {
                println!("New Client Connected");
                listen_for_messages(&window, stream)
            }
            Err(_) => println!("Error while new client try to connect"),
        }
    }
}

fn listen_for_messages(window: &Window, stream: TcpStream) {
    let mut reader = BufReader::new(stream);
    let mut line = String::new();

    reader.read_line(&mut line).expect("Can't read the line");
    while !line.is_empty() {
        println!("Received Line: {}", line);
        line = String::new();
        reader.read_line(&mut line).expect("Can't read the line");
    }
    println!("Client disconnected!");
}
