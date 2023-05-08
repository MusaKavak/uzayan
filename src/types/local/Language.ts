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
}

export type SettingCardContent = {
    Title: string,
    Description: string
}