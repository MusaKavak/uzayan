use rustls::{ClientConnection, Stream};
use std::io::{BufRead, BufReader, Write};
use std::net::TcpStream;
use std::thread;
use tauri::{command, Window};

/*
    Connection Status
    0 = Disconnected
    10 = Insecure
    23 = Secure
*/
static mut CONNECTION: u8 = 0;
static mut SOCKET: Option<TcpStream> = None;
//Rustls Client Connection
static mut TLS_CONNECTION: Option<ClientConnection> = None;
//Rustls Stream For Simplify Read&Write Operations
static mut TLS_SOCKET: Option<Stream<'_, ClientConnection, TcpStream>> = None;

#[command]
pub fn connect(window: Window, address: String, secure: bool) -> u8 {
    unsafe {
        if CONNECTION != 0 {
            return CONNECTION;
        };

        match TcpStream::connect(address) {
            Ok(mut socket) => {
                if !secure {
                    socket.write(&[200]).unwrap();
                }
                SOCKET = Some(socket);
                if secure {
                    match crate::tls_client_connection::get() {
                        Ok(tcc) => {
                            TLS_CONNECTION = Some(tcc);
                            if let (Some(conn), Some(sock)) = (&mut TLS_CONNECTION, &mut SOCKET) {
                                let mut stream = Stream::new(conn, sock);
                                stream.write(&[200]).unwrap();
                                TLS_SOCKET = Some(stream)
                            } else {
                                println!("Empty parameter while creating Stream!");
                                close_connections();
                                return 0;
                            }

                            CONNECTION = 20;
                        }
                        Err(e) => {
                            println!("Client connection error: \n{}", e.to_string());
                            close_connections();
                            return 0;
                        }
                    }
                } else {
                    CONNECTION = 10;
                }

                thread::spawn(move || {
                    listen_for_messages(window);
                });

                return CONNECTION;
            }
            Err(e) => {
                println!("Error while connection To Server: \n{}", e.to_string());
                return 0;
            }
        };
    };
}

#[command]
pub fn emit_message(window: Window, message: String) {
    unsafe {
        thread::spawn(move || {
            let mut writer: Box<dyn Write> = match CONNECTION {
                10 => match &SOCKET {
                    Some(s) => Box::new(s),
                    None => panic!(),
                },

                20 => match &mut TLS_SOCKET {
                    Some(ts) => Box::new(ts),
                    None => panic!(),
                },
                _ => {
                    panic!()
                }
            };

            let buf = message.as_bytes();
            writer.write(buf).unwrap_or_else(|e| {
                close_connections();
                window.emit("Disconnected", "").unwrap();
                panic!("Error while writing to stream {}", e);
            });
        });
    }
}

unsafe fn listen_for_messages(window: Window) {
    let mut reader: Box<dyn BufRead> = match CONNECTION {
        10 => match &SOCKET {
            Some(s) => Box::new(BufReader::new(s)),
            None => panic!(),
        },

        20 => match &mut TLS_SOCKET {
            Some(ts) => Box::new(BufReader::new(ts)),
            None => panic!(),
        },
        _ => {
            panic!()
        }
    };

    loop {
        let mut line = String::new();
        match reader.read_line(&mut line) {
            Err(e) => {
                print!("Error While Reading Line: \n{}", e);
                close_connections();
            }
            Ok(_) => {
                if line.is_empty() {
                    break;
                }
                println!("Received New Line ({})", line.len());
                window.emit("TcpMessage", line).unwrap();
            }
        }
    }

    println!("Disconnected From Server");
    close_connections();
    window.emit("Disconnected", "").unwrap();
}

unsafe fn close_connections() {
    if let Some(socket) = &SOCKET {
        socket.shutdown(std::net::Shutdown::Both).unwrap();
    }

    SOCKET = None;
    TLS_SOCKET = None;
    TLS_CONNECTION = None;
    CONNECTION = 0;
}
