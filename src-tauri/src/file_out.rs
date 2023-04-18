use std::{
    fs::File,
    io::{Read, Result, Write},
    net::TcpStream,
    thread,
};

use json::object;
use tauri::command;

#[derive(serde::Deserialize)]
pub struct FilesToUpload {
    source: String,
    target: String,
}

#[command]
pub fn send_files(address: String, files_to_upload: Vec<FilesToUpload>) {
    thread::spawn(move || {
        let mut stream = get_stream(address).unwrap();
        let mut status = [0u8; 1];
        for f in files_to_upload.iter() {
            let (mut source_file, size) = get_source_file(&f.source).unwrap();
            let request_string = get_request_string(&f.target, size);

            stream.write(request_string.as_bytes()).unwrap();
            stream.read(&mut status).unwrap();
            println!("status : {}", status[0]);

            if status[0] == 100 {
                let mut buf = [0u8; 4096];
                println!("File Out Start");
                loop {
                    let bytes_read = source_file.read(&mut buf).unwrap();
                    if bytes_read == 0 {
                        break;
                    }
                    stream.write(&buf[..bytes_read]).unwrap();
                }
                println!("File Out End");
            }
            stream.read(&mut status).unwrap();
            println!("file ended with {}", status[0]);
            if status[0] != 99 {
                break;
            }
        }
        stream.write(String::from("done").as_bytes()).unwrap();
    });
}

fn get_request_string(path: &String, size: u64) -> String {
    let json = object! {
        path : path.clone(),
        size : size
    };
    let mut request_string = json::stringify(json);
    request_string.push_str("\n");
    return request_string;
}

fn get_source_file(path: &String) -> Result<(File, u64)> {
    match File::open(path) {
        Ok(file) => {
            let file_size = file.metadata().unwrap().len();
            return Ok((file, file_size));
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
