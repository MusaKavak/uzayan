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
        thread::spawn(|| {
            match &mut STREAM {
                None => {
                    println!("There Is No Large File Stream Avaliable");
                    window.emit("EndOfFile", false).unwrap();
                    return;
                }
                Some(stream) => start_receiving(stream, window, request),
            };
        })
    };
}

pub fn start_receiving(stream: &mut TcpStream, window: Window, request: ReceiveFileRequest) {
    let mut file = get_file_to_write(&request).unwrap();
    let size: usize = request.file_size.parse().unwrap();
    stream.write(request.request_message.as_bytes()).unwrap();
    stream.flush().unwrap();
    request_progress_bar(&window, request);
    read_and_write_to_file(stream, &mut file, size);
    window.emit("EndOfFile", true).unwrap();
}

fn read_and_write_to_file(stream: &mut TcpStream, file: &mut File, size: usize) {
    let mut buffer = [0u8; 4096];
    let mut received = 0;

    loop {
        if received >= size {
            break;
        };
        let bytes_read = stream.read(&mut buffer).expect("Can't Read");
        if bytes_read == 0 {
            break;
        }
        received += bytes_read;
        file.write_all(&buffer[..bytes_read]).unwrap();
    }
    println!("Received {} bytes expected {} bytes", received, size);
}

fn request_progress_bar(window: &Window, request: ReceiveFileRequest) {
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
}

fn get_file_to_write(request: &ReceiveFileRequest) -> Result<File, std::io::Error> {
    let mut pathbuf = PathBuf::from(&request.save_location).join(&request.name);
    pathbuf.set_extension(&request.extension);
    match File::create(pathbuf) {
        Ok(file) => return Ok(file),
        Err(e) => return Err(e),
    }
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
