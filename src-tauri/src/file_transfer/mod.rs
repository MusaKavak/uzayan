pub mod receive;
pub mod send;
mod str;

#[derive(serde::Deserialize, Debug)]
pub struct FileTransferObject {
    pub source: String,
    pub target: String,
}
