use std::fs::File;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::TcpStream;
use std::path::{Path, PathBuf};
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

#[command]
pub fn connect_for_large_file_transaction(
    message: String,
    address: String,
    name: String,
    extension: String,
    save_location: String,
) {
    unsafe {
        thread::spawn(move || match &mut TcpStream::connect(address) {
            Ok(stream) => receive_file(stream, message, name, extension, save_location),
            Err(_) => println!("Can't Connect For Large File Transaction"),
        });
    };
}

unsafe fn receive_file(
    stream: &mut TcpStream,
    message: String,
    name: String,
    extension: String,
    save_location: String,
) {
    println!("Listening for large file");
    let mut buffer = [0u8; 4000];

    let mut pathbuf = PathBuf::from(&save_location).join(name);
    pathbuf.set_extension(extension);

    match &mut get_file_to_write(&pathbuf.as_path()) {
        Some(file) => {
            println!("File {:?}", file);
            stream.write(message.as_bytes()).unwrap();
            stream.flush().unwrap();
            loop {
                let bytes_read = stream.read(&mut buffer).expect("Can't Read");

                if bytes_read == 0 {
                    break;
                }

                file.write_all(&buffer[..bytes_read]).unwrap();
            }

            println!("Large File Stream Ends");
        }
        None => {}
    }
}

fn get_file_to_write(path: &Path) -> Option<File> {
    match path.try_exists() {
        Ok(_) => match File::create(path) {
            Ok(file) => return Some(file),
            Err(e) => {
                println!("File Not Created: {}", e);
                return None;
            }
        },
        Err(e) => {
            println!("Error While Creating File: {}", e);
            return None;
        }
    }
}
