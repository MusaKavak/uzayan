use std::{
    fs::File,
    io::{Read, Result, Write},
    net::TcpStream,
    thread,
    time::Duration,
};

use json::object;
use tauri::{command, Window};

use crate::progress::{send_progress_bar_request, ProgressUpdate};

#[derive(serde::Deserialize, Debug)]
pub struct FileToDownload {
    target: String,
    name: String,
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
pub fn receive_files(window: Window, address: String, files_to_receive: Vec<FileToDownload>) {
    thread::spawn(move || {
        let mut stream = get_stream(address).unwrap();

        let progress_update_base = send_progress_bar_request(&window, false);
        let denominator = format!("/{}", files_to_receive.len());

        for (i, f) in files_to_receive.iter().enumerate() {
            let file_to_download = create_file(&f.target).unwrap();

            let json = object! {path : f.source.clone()};
            let request_string = json::stringify(json) + "\n";
            stream.write(request_string.as_bytes()).unwrap();

            let mut status = [0u8; 1];
            stream.read(&mut status).unwrap();
            if status[0] == 100 {
                let mut progress_update = progress_update_base.clone();
                progress_update.name = f.name.clone();
                progress_update.ratio = format!("{}{}", i + 1, &denominator);
                unsafe {
                    fire_receiving(
                        file_to_download,
                        &stream,
                        f.size,
                        window.clone(),
                        progress_update,
                    )
                }
                stream.write(&[100]).unwrap();
            }
        }

        stream.write(String::from("done").as_bytes()).unwrap();
    });
}

unsafe fn fire_receiving(
    mut target_file: File,
    mut stream: &TcpStream,
    size: usize,
    window: Window,
    progress_update: ProgressUpdate,
) {
    let mut buf = [0u8; 4096];

    BYTES_READ = 0;

    let progress_tracker = thread::spawn(move || loop {
        let progress = BYTES_READ as f32 / size as f32 * 100.0;
        let mut payload = progress_update.clone();
        payload.progress = progress;
        if BYTES_READ == size {
            payload.progress = 100.0;
            window.emit("progress_update", payload).unwrap();
            BYTES_READ = 0;
            break;
        } else {
            window.emit("progress_update", payload).unwrap();
        }
        thread::sleep(Duration::from_millis(1000));
    });

    loop {
        let bytes_read = stream.read(&mut buf).unwrap();
        BYTES_READ += bytes_read;
        target_file.write_all(&buf[..bytes_read]).unwrap();
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
