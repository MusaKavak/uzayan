export type File = {
    name?: string
    path?: string,
    isFile?: boolean,
    isHidden?: boolean,
    parent?: File,
    children?: File[]
}