use json::object;
use std::{
    fs::File,
    io::{Read, Write},
    net::{Shutdown::Both, TcpStream},
    path::PathBuf,
    thread,
};
use tauri::{command, Window};

#[derive(serde::Deserialize, Debug)]
pub struct FileRequest {
    message: String,
    name: String,
    extension: String,
    location: String,
    size: usize,
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

static mut STREAM: Option<TcpStream> = None;
static mut OUT: Option<TcpStream> = None;

#[command]
pub fn open_large_file_stream(address: String) -> bool {
    unsafe {
        match TcpStream::connect(address) {
            Ok(mut stream) => {
                stream.write(&[201]).unwrap();
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

#[tauri::command]
pub fn request_file(window: Window, request: FileRequest) {
    println!("File {:?}", &request);
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

pub unsafe fn start_receiving(stream: &mut TcpStream, window: Window, request: FileRequest) {
    let mut file = get_file_to_write(&request).unwrap();
    FILE_SIZE = request.size;
    stream.write(request.message.as_bytes()).unwrap();
    stream.flush().unwrap();
    read_and_write_to_file(stream, &mut file);
    window.emit("EndOfFile", true).unwrap();
}

static mut FILE_SIZE: usize = 0;
static mut RECEIVED_BYTES: usize = 0;
unsafe fn read_and_write_to_file(stream: &mut TcpStream, file: &mut File) {
    let mut buffer = [0u8; 4096];
    RECEIVED_BYTES = 0;
    loop {
        if RECEIVED_BYTES >= FILE_SIZE {
            break;
        };
        let bytes_read = stream.read(&mut buffer).expect("Can't Read");
        if bytes_read == 0 {
            break;
        }
        RECEIVED_BYTES += bytes_read;
        file.write_all(&buffer[..bytes_read]).unwrap();
    }
    println!(
        "Received {} bytes expected {} bytes",
        RECEIVED_BYTES, FILE_SIZE
    );
}

fn get_file_to_write(request: &FileRequest) -> Result<File, std::io::Error> {
    let mut pathbuf = PathBuf::from(&request.location).join(&request.name);
    pathbuf.set_extension(&request.extension);
    match File::create(pathbuf) {
        Ok(file) => return Ok(file),
        Err(e) => return Err(e),
    }
}

#[command]
pub fn get_current_progress() -> f32 {
    unsafe { (RECEIVED_BYTES as f32 / FILE_SIZE as f32) * 100.0 }
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
