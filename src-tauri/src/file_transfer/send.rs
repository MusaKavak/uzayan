use super::FileTransferObject;
use crate::{file_transfer::ProgressUpdate, stream::Stream};
use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
    thread,
    time::Duration,
};
use tauri::{command, Window};

#[command]
pub fn send_files(
    window: Window,
    address: String,
    secure: bool,
    id: u16,
    files: Vec<FileTransferObject>,
) {
    thread::spawn(move || {
        let result = if secure {
            match crate::stream::new_secure(address) {
                Ok(stream) => {
                    iter_files(stream, id, window, files);
                    Ok("")
                }
                Err(e) => Err(format!("Can't Connect With Secure Connection:\n{e}")),
            }
        } else {
            match crate::stream::new_regular(address) {
                Ok(stream) => {
                    iter_files(stream, id, window, files);
                    Ok("")
                }
                Err(e) => Err(format!("Can't Connect With Regular Connection:\n{e}")),
            }
        };

        if let Err(e) = result {
            println!("File Transfer Error: {e}");
        };
    });
}

fn iter_files<T: Read + Write>(
    mut stream: Stream<T>,
    id: u16,
    window: Window,
    files_to_send: Vec<FileTransferObject>,
) {
    stream.write(&[202]).unwrap();

    for (i, file) in files_to_send.iter().enumerate() {
        let pu = ProgressUpdate::new(format!("{id}{i}"), true);
        send(&mut stream, file, &window, pu).unwrap();
        let mut buf_result = [0u8; 1];
        stream.read(&mut buf_result).unwrap();
        if buf_result[0] == 100 {
            println!("Continue...")
        }
    }

    stream.write(b"***DONE***\n").unwrap();
}

fn send<T: Read + Write>(
    stream: &mut Stream<T>,
    file: &FileTransferObject,
    window: &Window,
    mut pu: ProgressUpdate,
) -> std::io::Result<String> {
    let path = Path::new(&file.source);

    let source_file = File::open(path)?;
    let file_size = source_file.metadata()?.len() as usize;

    send_request(stream, &file.target, file_size)?;

    let mut buf_result = [0u8; 1];
    stream.read(&mut buf_result)?;
    if buf_result[0] == 100 {
        println!("Starting..");
        let name = path.file_name().unwrap().to_str().unwrap().to_string();

        pu.name = name;

        unsafe { start_transfer(source_file, file_size, stream, window.clone(), pu)? };
    } else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::AlreadyExists,
            "File Already Exists",
        ));
    };
    Ok("".to_string())
}

static mut TOTAL_WROTE: usize = 0;
unsafe fn start_transfer<T: Read + Write>(
    mut source_file: File,
    size: usize,
    stream: &mut Stream<T>,
    window: Window,
    pu: ProgressUpdate,
) -> std::io::Result<String> {
    TOTAL_WROTE = 0;

    let progress = thread::spawn(move || loop {
        let perc = TOTAL_WROTE as f64 / size as f64 * 100.0;

        let mut payload = pu.clone();

        payload.perc = format!("{:.2}%", perc);

        println!("Prog{perc}");

        window.emit("progress_update", payload).unwrap();
        if perc == 100.0 {
            break;
        }
        thread::sleep(Duration::from_millis(1000));
    });

    let mut buf: [u8; 4096] = [0; 4096];
    while TOTAL_WROTE < size {
        let bytes_read = source_file.read(&mut buf)?;
        stream.write(&mut buf[..bytes_read])?;
        TOTAL_WROTE += bytes_read;
    }

    progress.join().unwrap();

    println!("File Sent!");
    Ok("".to_string())
}

fn send_request<T: Read + Write>(
    stream: &mut Stream<T>,
    target: &String,
    file_size: usize,
) -> std::io::Result<usize> {
    let json = format!("{{ \"path\": \"{}\", \"size\": {} }}\n", target, file_size);
    stream.write(json.as_bytes())
}
