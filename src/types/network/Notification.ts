export type Notification = {
    key: string
    packageName: string
    title?: string
    text?: string,
    bigText?: string,
    infoText?: string
    largeIcon?: string,
    smallIcon?: string,
    actions?: string[],
    isGroup: boolean,
    groupKey: string,
    progressMax?: number,
    progress?: number,
}