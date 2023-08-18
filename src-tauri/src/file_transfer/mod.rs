pub mod receive;
pub mod send;
mod str;

#[derive(serde::Deserialize, Debug)]
pub struct FileTransferObject {
    pub source: String,
    pub target: String,
}

#[derive(serde::Serialize, Clone)]
pub struct ProgressUpdate {
    id: String,
    name: String,
    perc: String,
    isout: bool,
    error: Option<String>,
    path: Option<String>,
}
