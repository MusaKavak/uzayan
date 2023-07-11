export type Language = {
    AppSettings: {
        Size: {
            Self: string
            BarWidth: SettingCardContent
            BarHeightWhenClosed: SettingCardContent
        }
        Position: {
            Self: string
            IsWindowCentered: SettingCardContent
            WindowPositionFromLeft: SettingCardContent
        }
        DownloadLocation: {
            Self: string
            RememberDownloadLocation: SettingCardContent
            DonwloadFileLocation: SettingCardContent
        }
        Duration: {
            Self: string
            WindowOpenDelay: SettingCardContent
            NotificationDuration: SettingCardContent
            TransitionDuration: SettingCardContent
        }
    }
    Appearance: {
        Self: string
        ThemeCardTitle: string
        ThemeCardText: string
        Variables: {
            "--clr-background": string
            "--clr-foreground": string
            "--clr-highlight": string
            "--clr-font": string
            "--clr-font-faded": string
            "--clr-accent": string
            "--clr-accent-highlight": string
            "--clr-shadow": string
            "--border-radius": string
            "--gap": string
            "--box-shadow": string
            [key: string]: string
        }
    }
}

export type SettingCardContent = {
    Title: string,
    Description: string
}