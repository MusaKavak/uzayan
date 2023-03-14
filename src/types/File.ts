export type File = {
    name?: string
    extension?: string,
    path?: string,
    isFile?: boolean,
    isHidden?: boolean,
    size?: number,
    isRoot?: boolean,
    parent?: File,
    children?: File[]
}