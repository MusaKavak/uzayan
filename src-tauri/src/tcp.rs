use std::io::{BufRead, BufReader, Write};
use std::net::{Shutdown::Both, TcpStream};
use std::thread;

use tauri::{command, Window};

use crate::frontend::{emit, set_window};

static mut STREAM: Option<TcpStream> = None;
static mut IS_CONNECTED: bool = false;

#[command]
pub fn connect(window: Window, address: String) -> bool {
    unsafe {
        set_window(window);
        if !IS_CONNECTED {
            match TcpStream::connect(&address) {
                Ok(mut stream) => {
                    stream.write(&[200]).unwrap();
                    STREAM = Some(stream);
                    IS_CONNECTED = true;
                    listen_for_messages();
                    println!("Connected To: {}", address);
                    return true;
                }
                Err(_) => {
                    println!("Connection Refused From: {}", address);
                    return false;
                }
            };
        } else {
            return true;
        }
    };
}

#[command]
pub fn emit_message(message: String) {
    unsafe {
        thread::spawn(move || match &mut STREAM {
            Some(stream) => {
                let buf = message.as_bytes();
                stream.write(buf).unwrap_or_else(|e| {
                    stream.shutdown(Both).unwrap();
                    STREAM = None;
                    IS_CONNECTED = false;
                    panic!("Error while writing to stream {}", e);
                });
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

                loop {
                    let mut line = String::new();
                    reader.read_line(&mut line).expect("Can't read the line");
                    if line.is_empty() {
                        break;
                    }
                    println!("Received New Line ({})", line.len());
                    emit("TcpMessage", line, address.clone());
                }
                println!("Disconnected From Server");
                STREAM = None;
                IS_CONNECTED = false;
            }
            None => {}
        };
    });
}
