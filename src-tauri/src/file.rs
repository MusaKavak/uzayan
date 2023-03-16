use std::{
    fs::File,
    io::{Read, Write},
    net::{Shutdown::Both, TcpStream},
    path::PathBuf,
    thread,
};

use tauri::{command, Window};

static mut STREAM: Option<TcpStream> = None;

#[command]
pub fn open_large_file_stream(address: String) -> bool {
    unsafe {
        match TcpStream::connect(address) {
            Ok(stream) => {
                STREAM = Some(stream);
                println!("Connected For Large File Transaction");
                return true;
            }
            Err(_) => {
                println!("Can't Connect For Large File Transaction");
                return false;
            }
        };
    };
}

#[command]
pub fn receive_file(
    window: Window,
    request_message: String,
    name: String,
    extension: String,
    save_location: String,
) {
    unsafe {
        match &mut STREAM {
            None => {
                println!("There Is No Large File Stream Avaliable");
                window.emit("EndOfFile", false).unwrap();
                return;
            }
            Some(stream) => thread::spawn(move || -> () {
                match &mut get_file_to_write(save_location, name, extension) {
                    None => {
                        window.emit("EndOfFile", false).unwrap();
                        ()
                    }
                    Some(file) => {
                        stream.write(request_message.as_bytes()).unwrap();
                        stream.flush().unwrap();
                        let mut buffer = [0u8; 4000];
                        loop {
                            let bytes_read = stream.read(&mut buffer).expect("Can't Read");
                            println!("{}", bytes_read);
                            if bytes_read == 0 {
                                println!("This work after ");
                                break;
                            }
                            if bytes_read == 3 && &buffer[..3] == [64, 64, 64] {
                                println!("This Should Work! ");
                                break;
                            }
                            file.write_all(&buffer[..bytes_read]).unwrap();
                        }
                        println!("Large File Stream Ends");
                        window.emit("EndOfFile", true).unwrap();
                    }
                };
            }),
        };
    };
}

#[command]
pub fn close_large_file_stream(message: String) -> bool {
    unsafe {
        match &mut STREAM {
            Some(stream) => {
                stream.write(message.as_bytes()).unwrap();
                stream.shutdown(Both).unwrap();
                STREAM = None;
                true
            }
            None => false,
        }
    }
}

fn get_file_to_write(path: String, name: String, extension: String) -> Option<File> {
    let mut pathbuf = PathBuf::from(path).join(name);
    pathbuf.set_extension(extension);
    match pathbuf.try_exists() {
        Ok(_) => match File::create(pathbuf) {
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
