export type Notification = {
    key: string
    groupKey: string,
    title?: string
    text?: string,
    bigText?: string,
    infoText?: string
    largeIcon?: string,
    actions?: string[],
    progressMax?: number,
    progress?: number,
}