use std::{
    fs::File,
    io::{Read, Result, Write},
    net::TcpStream,
    path::Path,
    thread,
    time::Duration,
};

use json::object;
use tauri::{command, Window};

use crate::progress::{send_progress_bar_request, ProgressUpdate};

#[derive(serde::Deserialize)]
pub struct FileToUpload {
    source: String,
    target: String,
}

static mut BYTES_WROTE: u64 = 0;

#[command]
pub fn send_files(window: Window, address: String, files_to_upload: Vec<FileToUpload>) {
    thread::spawn(move || {
        let mut stream = get_stream(address).unwrap();
        let mut status = [0u8; 1];

        let progress_update_base = send_progress_bar_request(&window, false);
        let denominator = format!("/{}", files_to_upload.len());

        for (i, f) in files_to_upload.iter().enumerate() {
            let (source_file, size, file_name) = get_source_file(&f.source).unwrap();
            let request_string = get_request_string(&f.target, size);

            stream.write(request_string.as_bytes()).unwrap();
            stream.read(&mut status).unwrap();

            if status[0] == 100 {
                let mut progress_update = progress_update_base.clone();
                progress_update.name = file_name;
                progress_update.ratio = format!("{}{}", i + 1, &denominator);
                unsafe { fire_sending(size, source_file, &stream, window.clone(), progress_update) }
            }

            stream.read(&mut status).unwrap();
            if status[0] != 99 {
                break;
            }
        }
        stream.write(String::from("done").as_bytes()).unwrap();
    });
}

unsafe fn fire_sending(
    size: u64,
    mut source_file: File,
    mut stream: &TcpStream,
    window: Window,
    progress_update: ProgressUpdate,
) {
    let mut buf = [0u8; 4096];
    println!("File Out Start");

    let progress_tracker = thread::spawn(move || loop {
        let progress = BYTES_WROTE as f32 / size as f32 * 100.0;
        let mut payload = progress_update.clone();
        payload.progress = progress;
        if BYTES_WROTE == size {
            payload.progress = 100.0;
            window.emit("progress_update", payload).unwrap();
            BYTES_WROTE = 0;
            break;
        } else {
            window.emit("progress_update", payload).unwrap();
        }
        thread::sleep(Duration::from_millis(1000))
    });

    loop {
        let bytes_read = source_file.read(&mut buf).unwrap();
        BYTES_WROTE += bytes_read as u64;
        stream.write(&buf[..bytes_read]).unwrap();
        if BYTES_WROTE == size {
            break;
        }
    }
    println!("File Out End");
    progress_tracker.join().unwrap();
}

fn get_request_string(path: &String, size: u64) -> String {
    let json = object! {
        path : path.clone(),
        size : size
    };
    let request_string = json::stringify(json) + "\n";
    return request_string;
}

fn get_source_file(path_string: &String) -> Result<(File, u64, String)> {
    let path = Path::new(path_string);
    match File::open(path) {
        Ok(file) => {
            let file_size = file.metadata().unwrap().len();
            let file_name = path.file_name().unwrap().to_str().unwrap().to_string();
            return Ok((file, file_size, file_name));
        }
        Err(e) => {
            println!("Error while openning a file: {}", e.kind());
            return Err(e);
        }
    }
}

fn get_stream(address: String) -> Result<TcpStream> {
    match TcpStream::connect(address) {
        Ok(mut stream) => {
            stream.write(&[202]).unwrap();
            println!("Connected to send files");
            return Ok(stream);
        }
        Err(e) => {
            println!("Couldn't connect to send files E: {}", e.kind());
            Err(e)
        }
    }
}
