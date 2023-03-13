export type File = {
    name?: string
    extension?: string,
    path?: string,
    isFile?: boolean,
    isHidden?: boolean,
    parent?: File,
    children?: File[]
}