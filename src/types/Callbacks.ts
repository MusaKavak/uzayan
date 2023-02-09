import { AndroidMediaSession } from "./AndroidTypes"

export interface UdpSocketListenerCallbacks {
    mediaSessions(sessions: AndroidMediaSession[]): void
    singleMediaSession(session: AndroidMediaSession): void
}

export interface WindowLayoutCallbacks {
    windowOpened(): void
    windowClosed(): void
}