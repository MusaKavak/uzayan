mod tls_client_connection;

use std::{
    io::{BufRead, BufReader, Read, Result as IoResult, Write},
    net::{SocketAddr, TcpStream},
    time::Duration,
};

use rustls::{ClientConnection, StreamOwned};
use tauri::Window;

pub fn new_regular(address: String) -> Result<Stream<TcpStream>, String> {
    let address: SocketAddr = address.parse().expect("Invalid Address");
    match TcpStream::connect_timeout(&address, Duration::from_secs(2)) {
        Ok(stream) => Ok(Stream { stream }),
        Err(e) => Err(e.to_string()),
    }
}

pub fn new_secure(
    address: String,
) -> Result<Stream<StreamOwned<ClientConnection, TcpStream>>, String> {
    let address: SocketAddr = address.parse().expect("Invalid Address");
    match TcpStream::connect_timeout(&address, Duration::from_secs(2)) {
        Ok(sock) => match tls_client_connection::get() {
            Ok(conn) => Ok(Stream {
                stream: StreamOwned { conn, sock },
            }),
            Err(e) => Err(e.to_string()),
        },
        Err(e) => Err(e.to_string()),
    }
}

pub struct Stream<T: Read + Write> {
    pub stream: T,
}

impl<T: Read + Write> Stream<T> {
    pub fn read(&mut self, buf: &mut [u8]) -> IoResult<usize> {
        self.stream.read(buf)
    }

    pub fn write(&mut self, buf: &[u8]) -> IoResult<usize> {
        self.stream.write(buf)
    }

    pub fn write_line(&mut self, message: String) -> Result<usize, String> {
        match self.write(message.as_bytes()) {
            Ok(wrote) => Ok(wrote),
            Err(e) => Err(e.to_string()),
        }
    }

    pub fn listen_stream(&mut self, window: &Window) -> Result<String, String> {
        let mut reader = BufReader::new(&mut self.stream);

        loop {
            let mut line = String::new();
            match reader.read_line(&mut line) {
                Err(e) => {
                    return Err(e.to_string());
                }
                Ok(_) => {
                    println!("Received New Line ({})", line.len());
                    if line.is_empty() {
                        return Err("Connection Closed!".to_string());
                    }
                    window.emit("TcpMessage", line).unwrap();
                }
            }
        }
    }
}

pub trait StreamTools {
    fn shutdown(&self);
}

impl StreamTools for Stream<TcpStream> {
    fn shutdown(&self) {
        let _ = self.stream.shutdown(std::net::Shutdown::Both);
    }
}

impl StreamTools for Stream<StreamOwned<ClientConnection, TcpStream>> {
    fn shutdown(&self) {
        let _ = self.stream.sock.shutdown(std::net::Shutdown::Both);
    }
}
