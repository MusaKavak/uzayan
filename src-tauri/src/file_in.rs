use std::{
    fs::File,
    io::{Read, Result, Write},
    net::TcpStream,
    thread,
    time::Duration,
};

use json::object;
use tauri::command;

#[derive(serde::Deserialize, Debug)]
pub struct FileToDownload {
    target: String,
    source: String,
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

static mut BYTES_READ: usize = 0;

#[command]
pub fn receive_files(address: String, files_to_receive: Vec<FileToDownload>) {
    thread::spawn(move || {
        let mut stream = get_stream(address).unwrap();

        for f in files_to_receive.iter() {
            let file_to_download = create_file(&f.target).unwrap();

            let json = object! {path : f.source.clone()};
            let request_string = json::stringify(json) + "\n";
            stream.write(request_string.as_bytes()).unwrap();

            let mut status = [0u8; 1];
            stream.read(&mut status).unwrap();
            if status[0] == 100 {
                unsafe { fire_receiving(file_to_download, &stream, f.size) }
                stream.write(&[100]).unwrap();
            }
        }

        stream.write(String::from("done").as_bytes()).unwrap();
    });
}

unsafe fn fire_receiving(mut f: File, mut stream: &TcpStream, size: usize) {
    let mut buf = [0u8; 4096];
    BYTES_READ = 0;
    let progress_tracker = thread::spawn(move || loop {
        let progress = BYTES_READ as f32 / size as f32 * 100.0;
        println!("Progress: {progress}");
        if BYTES_READ == size {
            break;
        }
        thread::sleep(Duration::from_millis(1000));
    });

    loop {
        let bytes_read = stream.read(&mut buf).unwrap();
        BYTES_READ += bytes_read;
        f.write_all(&buf[..bytes_read]).unwrap();
        if BYTES_READ == size {
            break;
        }
    }
    progress_tracker.join().unwrap();
}

fn create_file(target: &String) -> Result<File> {
    match File::create(target) {
        Ok(file) => Ok(file),
        Err(e) => Err(e),
    }
}

fn get_stream(address: String) -> Result<TcpStream> {
    match TcpStream::connect(address) {
        Ok(mut stream) => {
            stream.write(&[201]).unwrap();
            println!("Connected to receive files");
            return Ok(stream);
        }
        Err(e) => {
            println!("Couldn't connect to receive files E: {}", e.kind());
            return Err(e);
        }
    };
}
