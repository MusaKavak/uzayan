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
    error: String,
    path: String,
}

impl ProgressUpdate {
    pub fn new(id: String, isout: bool) -> ProgressUpdate {
        ProgressUpdate {
            id,
            name: String::new(),
            perc: String::new(),
            isout,
            error: String::new(),
            path: String::new(),
        }
    }
}
