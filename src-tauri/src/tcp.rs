use std::io::{BufRead, BufReader, Write};
use std::net::{Shutdown::Both, TcpStream};
use std::thread;

use tauri::{command, Window};

static mut STREAM: Option<TcpStream> = None;
static mut IS_CONNECTED: bool = false;

#[command]
pub fn connect(window: Window, address: String) -> bool {
    unsafe {
        if !IS_CONNECTED {
            match TcpStream::connect(&address) {
                Ok(mut stream) => {
                    stream.write(&[200]).unwrap();
                    STREAM = Some(stream);
                    IS_CONNECTED = true;
                    listen_for_messages(window);
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
pub fn emit_message(window: Window, message: String) {
    unsafe {
        thread::spawn(move || match &mut STREAM {
            Some(stream) => {
                let buf = message.as_bytes();
                stream.write(buf).unwrap_or_else(|e| {
                    stream.shutdown(Both).unwrap();
                    STREAM = None;
                    IS_CONNECTED = false;
                    window.emit("Disconnected", "").unwrap();
                    panic!("Error while writing to stream {}", e);
                });
            }
            None => {
                window.emit("Disconnected", String::new()).unwrap();
                println!("There is no stream avaliable!")
            }
        });
    };
}

unsafe fn listen_for_messages(window: Window) {
    thread::spawn(move || {
        match &mut STREAM {
            Some(stream) => {
                let mut reader = BufReader::new(stream);

                loop {
                    let mut line = String::new();
                    reader.read_line(&mut line).expect("Can't read the line");
                    if line.is_empty() {
                        break;
                    }
                    println!("Received New Line ({})", line.len());
                    window.emit("TcpMessage", line).unwrap();
                }
                println!("Disconnected From Server");
                STREAM = None;
                IS_CONNECTED = false;
                window.emit("Disconnect", "").unwrap();
            }
            None => {}
        };
    });
}
