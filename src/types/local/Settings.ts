export type AppSettings = {
    Size: {
        BarWidth: number
        BarHeightWhenClosed: number
    }
    Position: {
        IsWindowCentered: boolean
        WindowPositionFromLeft: number
    }
    DownloadLocation: {
        RememberDownloadLocation: boolean
        DonwloadFileLocation?: string
    }
    Duration: {
        WindowOpenDelay: number
        NotificationDuration: number
        TransitionDuration: number

    }
    LanguageCode: string
}

export const DefaultAppSettings: AppSettings = {
    Size: {
        BarWidth: 500,
        BarHeightWhenClosed: 9,
    },
    Position: {
        IsWindowCentered: false,
        WindowPositionFromLeft: 100,
    },
    DownloadLocation: {
        RememberDownloadLocation: false,
        DonwloadFileLocation: ""
    },
    Duration: {
        WindowOpenDelay: 500,
        NotificationDuration: 8000,
        TransitionDuration: 500,
    },
    LanguageCode: "en"
}

export type ApperanceSettings = {
    "--clr-background": string
    "--clr-background-bright": string
    "--clr-background-dark": string
    "--clr-primary": string
    "--clr-primary-dark": string
    "--clr-accent": string
    "--clr-accent-dark": string
    "--clr-accent-transparent": string
    "--clr-shadow": string
    "--border-radius": string
    "--gap": string
    "--box-shadow": string
    [key: string]: string
}
export const DefaultApperanceSettings: ApperanceSettings = {
    "--clr-background": "#15152c",
    "--clr-background-bright": "#232347",
    "--clr-background-dark": "#15152c",
    "--clr-primary": "#eaeaea",
    "--clr-primary-dark": "#b3b3b3",
    "--clr-accent": "#ff6600",
    "--clr-accent-dark": "#c54f00",
    "--clr-accent-transparent": "#ff6600b3",
    "--clr-shadow": "#000000",
    "--border-radius": "0px",
    "--gap": ".7rem",
    "--box-shadow": " 0 0 8px 1px var(--clr-shadow)"
}