use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
    thread,
    time::Duration,
};

use tauri::{command, Window};

use crate::stream::Stream;

use super::FileTransferObject;

#[derive(Clone, serde::Serialize)]

struct UpdateProgressRequest {
    progress_id: u8,
    ratio: f32,
}

static mut BYTES_READ: usize = 0;

#[command]
pub fn receive_files(
    _window: Window,
    address: String,
    secure: bool,
    files: Vec<FileTransferObject>,
) {
    thread::spawn(move || unsafe {
        if secure {
            crate::stream::new_secure(address)
                .unwrap()
                .receive_files(files)
                .unwrap();
        } else {
            crate::stream::new_regular(address)
                .unwrap()
                .receive_files(files)
                .unwrap();
        };
    });
}

impl<T: Read + Write> Stream<T> {
    pub unsafe fn receive_files(
        &mut self,
        files_to_receive: Vec<FileTransferObject>,
    ) -> Result<String, String> {
        self.stream.write(&[201]).unwrap();

        let mut buf: [u8; 4096] = [0; 4096];

        for file in files_to_receive.iter() {
            BYTES_READ = 0;
            let path = Path::new(&file.target);

            if path.exists() {
                continue;
            }

            let mut target_file = File::create(path).unwrap();

            self.stream
                .write(format!("{}{}", file.source, "\n").as_bytes())
                .unwrap();

            let read = self.stream.read(&mut buf).unwrap();
            let file_size: usize = String::from_utf8(buf[..read].to_vec())
                .unwrap()
                .parse()
                .unwrap();

            let progress = thread::spawn(move || loop {
                let prog = BYTES_READ as f64 / file_size as f64 * 100.0;
                println!("---{prog}%");
                if prog == 100.0 {
                    break;
                }
                thread::sleep(Duration::from_secs(1));
            });

            while BYTES_READ < file_size {
                let bytes_read = self.stream.read(&mut buf).unwrap();

                target_file.write_all(&mut buf[..bytes_read]).unwrap();
                BYTES_READ += bytes_read;
            }

            progress.join().unwrap();

            println!("File Received!");
        }

        self.stream.write(b"***DONE***\n").unwrap();
        Ok("".to_string())
    }
}
