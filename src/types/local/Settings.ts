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
    "--clr-background": "#0a1124dd",
    "--clr-foreground": "#1f103dff",
    "--clr-highlight": "#77767bff",
    "--clr-font": "#ffffffff",
    "--clr-font-faded": "#77767bff",
    "--clr-accent": "#c50ed2ff",
    "--clr-shadow": "#000000ff",
    "--clr-border": "#ffffffff",
    "--border-radius": "15px",
    "--gap": ".7rem",
    "--box-shadow": " 0 0 8px 1px var(--clr-shadow)"
}