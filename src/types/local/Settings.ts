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
    ScreencastCommand: string
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
    LanguageCode: "en",
    ScreencastCommand: `
        ffmpeg -f x11grab -s {width}x{height} \
        -r {framerate} -i :0+{x},{y} -pix_fmt yuv420p \
        -c:v libx264 -crf 40 -b 3M -g 30 \
        -preset ultrafast -tune zerolatency \
        -profile:v baseline -threads 1 \
        -max_delay 50 \
        -f mpegts udp://{host}:{port}
    `
}

export type AppearanceSettings = {
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

export const DefaultAppearanceSettings: AppearanceSettings = {
    "--clr-background": "#0a1124dd",
    "--clr-foreground": "#1f103dff",
    "--clr-highlight": "#77767bff",
    "--clr-font": "#ffffffff",
    "--clr-font-faded": "#77767bff",
    "--clr-accent": "#c50ed2ff",
    "--clr-accent-highlight": "#c50ed2ff",
    "--clr-shadow": "#000000ff",
    "--border-radius": "15px",
    "--gap": ".7rem",
    "--box-shadow": " 0 0 8px 1px var(--clr-shadow)"
}