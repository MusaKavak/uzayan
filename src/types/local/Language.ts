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
    AppearanceSettings: {
        Colors: {
            Self: string
            "--clr-background": string
            "--clr-background-bright": string
            "--clr-background-dark": string
            "--clr-primary": string
            "--clr-primary-dark": string
            "--clr-accent": string
            "--clr-accent-dark": string
            "--clr-accent-transparent": string
            "--clr-shadow": string
            [key: string]: string
        }
        Appearance: {
            Self: string
            "--border-radius": SettingCardContent
            "--gap": SettingCardContent
            "--box-shadow": SettingCardContent
        }
    }
}

export type SettingCardContent = {
    Title: string,
    Description: string
}