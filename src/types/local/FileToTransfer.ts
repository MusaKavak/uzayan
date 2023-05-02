export type FileRequest = {
    message: string,
    name: string,
    extension: string,
    location: string,
    size: number,
}

export type FileToDownload = {
    id: string,
    name: string
    size: number,
}
