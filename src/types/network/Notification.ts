export type Notification = {
    key: string
    groupKey: string,
    packageName: string
    title?: string
    text?: string,
    bigText?: string,
    infoText?: string
    largeIcon?: string,
    smallIcon?: string,
    actions?: string[],
    isGroup: boolean,
    progressMax?: number,
    progress?: number,
}