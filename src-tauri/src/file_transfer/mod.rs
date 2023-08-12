use std::{io::Read, net::TcpStream};

pub mod receive;
pub mod send;
mod str;

#[derive(serde::Deserialize, Debug)]
pub struct FileTransferObject {
    source: String,
    target: String,
}

pub fn get_stream(address: String, isSecure: bool) -> Box<dyn Read> {
    match TcpStream::connect(address) {
        Ok(stream) => {
            return Box::new(stream);
        }
        Err(_) => todo!(),
    }
}
