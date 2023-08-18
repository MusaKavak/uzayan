use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
    thread,
    time::Duration,
};

use tauri::{command, Window};

use crate::{file_transfer::ProgressUpdate, stream::Stream};

use super::FileTransferObject;

#[derive(Clone, serde::Serialize)]

struct UpdateProgressRequest {
    progress_id: u8,
    ratio: f32,
}

static mut BYTES_READ: usize = 0;

#[command]
pub fn receive_files(
    window: Window,
    address: String,
    secure: bool,
    id: u16,
    files: Vec<FileTransferObject>,
) {
    thread::spawn(move || unsafe {
        if secure {
            receive(
                crate::stream::new_secure(address).unwrap(),
                id,
                window,
                files,
            );
        } else {
            receive(
                crate::stream::new_regular(address).unwrap(),
                id,
                window,
                files,
            );
        };
    });
}

unsafe fn receive<T: Read + Write>(
    mut stream: Stream<T>,
    id: u16,
    window: Window,
    files_to_receive: Vec<FileTransferObject>,
) {
    stream.write(&[201]).unwrap();
    let mut buf: [u8; 4096] = [0; 4096];

    for (i, file) in files_to_receive.iter().enumerate() {
        BYTES_READ = 0;
        let path = Path::new(&file.target);

        if path.exists() {
            continue;
        }

        let name = path.file_name().unwrap().to_str().unwrap().to_string();
        let target_file = File::create(path).unwrap();
        stream
            .write(format!("{}{}", file.source, "\n").as_bytes())
            .unwrap();

        let read = stream.read(&mut buf).unwrap();
        let file_size: usize = String::from_utf8(buf[..read].to_vec())
            .unwrap()
            .parse()
            .unwrap();

        start_transfer(
            format!("{id}{i}"),
            name,
            target_file,
            file_size,
            &mut stream,
            window.clone(),
        )
    }

    stream.write(b"***DONE***\n").unwrap();
}

static mut TOTAL_READ: usize = 0;
unsafe fn start_transfer<T: Read + Write>(
    id: String,
    name: String,
    mut target_file: File,
    size: usize,
    stream: &mut Stream<T>,
    window: Window,
) {
    TOTAL_READ = 0;

    let progress_update = ProgressUpdate {
        id,
        name,
        perc: String::new(),
        isout: false,
        error: None,
        path: None,
    };

    let progress = thread::spawn(move || loop {
        let perc = TOTAL_READ as f64 / size as f64 * 100.0;

        let mut payload = progress_update.clone();

        payload.perc = format!("{:.2}%", perc);

        println!("Prog{perc}");

        window.emit("progress_update", payload).unwrap();
        if perc == 100.0 {
            break;
        }
        thread::sleep(Duration::from_millis(1000));
    });

    while TOTAL_READ < size {
        let mut buf: [u8; 4096] = [0; 4096];
        let bytes_read = stream.read(&mut buf).unwrap();

        target_file.write_all(&mut buf[..bytes_read]).unwrap();
        TOTAL_READ += bytes_read;
    }

    progress.join().unwrap();

    println!("File Received!");
}
