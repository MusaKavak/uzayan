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
        DonwloadFileLocation: string
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

export type AppearanceSettings = {
    "--clr-background": string
    "--clr-foreground": string
    "--clr-highlight": string
    "--clr-font": string
    "--clr-font-faded": string
    "--clr-accent": string
    "--clr-shadow": string
    "--clr-border": string
    "--border-radius": string
    "--gap": string
    "--box-shadow": string
    [key: string]: string
}

export const DefaultAppearanceSettings: AppearanceSettings = {
    "--clr-background": "#15152c",
    "--clr-foreground": "#b95dbf",
    "--clr-highlight": "#b95dff",
    "--clr-font": "#eaeaea",
    "--clr-font-faded": "#b3b3b3",
    "--clr-accent": "#ff6600",
    "--clr-shadow": "#000000",
    "--clr-border": "#000000",
    "--border-radius": "15px",
    "--gap": ".7rem",
    "--box-shadow": " 0 0 8px 1px var(--clr-shadow)"
}