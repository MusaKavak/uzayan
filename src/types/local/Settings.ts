export type AppSettings = {
    BarWidth: number
    BarHeightWhenClosed: number
    WindowPositionFromLeft: number
    WindowOpeningDuration: number
    WindowOpenDelay: number
    IsWindowCentered: boolean
    ImageCountPerRequest: number
    RememberDownloadLocation: boolean
    DonwloadFileLocation?: string
    NotificationDuration: number
    TransitionDuration: number
}

export type ApperanceSettings = {
    "--clr-background": string,
    "--clr-background-bright": string,
    "--clr-background-dark": string,
    "--clr-primary": string,
    "--clr-primary-dark": string,
    "--clr-accent": string,
    "--clr-accent-dark": string,
    "--clr-accent-transparent": string,
    "--clr-shadow": string,
    "--sz-window-height-when-closed": string,
    "--border-radius": string,
    "--gap": string,
    "--box-shadow": string,
    "--transition": string,
    [key: string]: string
}