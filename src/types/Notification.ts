export type Notification = {
    key: string
    packageName: string
    infoText?: string
    largeIcon?: string
    title?: string
    text?: string,
    bigText?: string,
    actions?: string[],
    progress?: number,
    progressMax?: number,
    isGroup?: boolean
}