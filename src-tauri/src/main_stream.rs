use rustls::ClientConnection;
use std::net::TcpStream;
use std::thread;
use tauri::{command, Window};

use crate::stream::{new_regular, new_secure, Stream, StreamTools};

/*
    Connection TYPE
    0 = Disconnected
    10 = Insecure
    23 = Secure
*/
static mut CONNECTION_TYPE: u8 = 0;
static mut REGULAR: Option<Stream<TcpStream>> = None;
static mut SECURE: Option<Stream<rustls::StreamOwned<ClientConnection, TcpStream>>> = None;

#[command]
pub fn connect(window: Window, address: String, secure: bool) -> u8 {
    unsafe {
        if CONNECTION_TYPE != 0 {
            return CONNECTION_TYPE;
        };

        if secure {
            match new_secure(address) {
                Ok(mut stream) => {
                    stream.write(&[200]).unwrap();
                    SECURE = Some(stream);
                    CONNECTION_TYPE = 20;
                }
                Err(e) => {
                    println!("{e}");
                    close_connections();
                    return 0;
                }
            }
        } else {
            match new_regular(address) {
                Ok(mut stream) => {
                    stream.write(&[200]).unwrap();
                    REGULAR = Some(stream);
                    CONNECTION_TYPE = 10;
                }
                Err(e) => {
                    println!("{e}");
                    close_connections();
                    return 0;
                }
            }
        }

        thread::spawn(move || {
            println!("Listening start");
            listen_for_messages(window);
        });
        return CONNECTION_TYPE;
    }
}

#[command]
pub fn emit_message(window: Window, message: String) {
    thread::spawn(move || unsafe {
        let result = match CONNECTION_TYPE {
            10 => {
                if let Some(stream) = &mut REGULAR {
                    stream.write_line(message)
                } else {
                    Err("Regular Stream Is 'None'".to_string())
                }
            }
            20 => {
                if let Some(stream) = &mut SECURE {
                    stream.write_line(message)
                } else {
                    Err("Secure Stream Is 'None'".to_string())
                }
            }
            _ => Err("Not Connected".to_string()),
        };

        if let Err(e) = result {
            println!("Error While Writing To Stream:\n {}", e);
            window.emit("Disconnected", "").unwrap();
            close_connections();
        }
    });
}

unsafe fn listen_for_messages(window: Window) {
    let result = match CONNECTION_TYPE {
        10 => {
            if let Some(stream) = &mut REGULAR {
                stream.listen_stream(&window)
            } else {
                Err("Regular Stream Is 'None'".to_string())
            }
        }
        20 => {
            if let Some(stream) = &mut SECURE {
                stream.listen_stream(&window)
            } else {
                Err("Secure Stream Is 'None'".to_string())
            }
        }
        _ => Err("Not Connected".to_string()),
    };

    if let Err(e) = result {
        println!("End Of Listening To Stream:\n {}", e);
        window.emit("Disconnected", "").unwrap();
        close_connections();
    }
}

unsafe fn close_connections() {
    if let Some(stream) = &REGULAR {
        stream.shutdown();
    }
    if let Some(stream) = &SECURE {
        stream.shutdown();
    }

    REGULAR = None;
    SECURE = None;
    CONNECTION_TYPE = 0;
}
