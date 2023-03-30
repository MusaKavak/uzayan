use std::{
    fs::File,
    io::{Read, Write},
    net::{Shutdown::Both, TcpStream},
    path::PathBuf,
    thread,
};

use tauri::{command, Window};

static mut STREAM: Option<TcpStream> = None;

#[derive(serde::Deserialize)]
pub struct ReceiveFileRequest {
    request_message: String,
    name: String,
    extension: String,
    save_location: String,
    file_size: String,
}
#[derive(Clone, serde::Serialize)]
struct DownloadProgressBarRequest {
    progress_id: u8,
    received_files: String,
    file_name: String,
}

#[derive(Clone, serde::Serialize)]

struct UpdateProgressRequest {
    progress_id: u8,
    ratio: f32,
}

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
pub fn receive_file(window: Window, request: ReceiveFileRequest) {
    unsafe {
        match &mut STREAM {
            None => {
                println!("There Is No Large File Stream Avaliable");
                window.emit("EndOfFile", false).unwrap();
                return;
            }
            Some(stream) => thread::spawn(move || -> () {
                match &mut get_file_to_write(
                    request.save_location,
                    &request.name,
                    request.extension,
                ) {
                    None => {
                        window.emit("EndOfFile", false).unwrap();
                        ()
                    }
                    Some(file) => {
                        stream.write(request.request_message.as_bytes()).unwrap();
                        stream.flush().unwrap();
                        let mut buffer = [0u8; 4096];
                        let mut received = 0;
                        let size: usize = request.file_size.parse().unwrap();
                        window
                            .emit(
                                "CreateInputProgressBar",
                                DownloadProgressBarRequest {
                                    progress_id: 1,
                                    received_files: String::from("5/10"),
                                    file_name: request.name,
                                },
                            )
                            .unwrap();
                        loop {
                            if received >= size {
                                println!("File Ends");
                                break;
                            }
                            let bytes_read = stream.read(&mut buffer).expect("Can't Read");
                            println!("{}", bytes_read);
                            if bytes_read == 0 {
                                println!("This work after ");
                                break;
                            }
                            received += bytes_read;
                            window
                                .emit(
                                    "UpdateProgress",
                                    UpdateProgressRequest {
                                        progress_id: 1,
                                        ratio: (received as f32 / size as f32) * 100.0,
                                    },
                                )
                                .unwrap();
                            file.write_all(&buffer[..bytes_read]).unwrap();
                        }
                        println!("Large File Stream Ends");
                        println!(
                            "Received {} bytes expected {} bytes",
                            received, request.file_size
                        );
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

fn get_file_to_write(path: String, name: &String, extension: String) -> Option<File> {
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
