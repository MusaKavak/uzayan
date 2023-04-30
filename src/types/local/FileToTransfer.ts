export type FileRequest = {
    message: string,
    name: string,
    extension: string,
    location: string,
    size: number,
}

export type FileToDownload = {
    source: string,
    size: number,
}
