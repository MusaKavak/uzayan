import { SessionSvg } from "../assets/session.svg";
import { Socket } from "../connection/Socket";
import { MediaSession } from "../types/MediaSession";
import { MediaSessionState } from "../types/MediaSessionState";
import { Public } from "./Public";

export default class MediaSessionManager {
  private svg = new SessionSvg()
  private container: HTMLElement | null = document.getElementById("media-session-container")

  createMediaSessions(sessions: MediaSession[]) {
    if (this.container != null) {
      this.container.innerHTML = ""
      sessions.sort((a, b) => a.token > b.token ? 1 : -1)
      sessions.forEach(s => this.createSessionElement(s))
    }
  }

  updateMediaSessionState(state: MediaSessionState) {
    const controls = document.getElementById("session-control-" + state.token)
    const progressBar = document.getElementById("session-progress-bar-" + state.token)

    if (state.isActive) controls?.classList.add("playing")
    else controls?.classList.remove("playing")

    if (progressBar != null && state.position != undefined && state.duration != undefined) {
      const newProgressBar = this.getProgressBar(state.position, state.duration, state.token)
      const startRatio = (100 * state.position) / state.duration
      const duration = (state.duration - state.position) / 1000
      newProgressBar?.setAttribute("style", `--startPoint: ${startRatio}%; --duration: ${duration}s;`)
      if (newProgressBar != undefined) progressBar.replaceWith(newProgressBar)
    }
  }

  updateMediaSession(session: MediaSession) {
    const token = session.token

    const sessionImage = document.getElementById("session-image-" + token)
    const title = document.getElementById("session-title-" + token)
    const artist = document.getElementById("session-artist-" + token)

    sessionImage?.setAttribute(
      "src",
      session.albumArt != null ? Public.base64head + session.albumArt : ""
    )
    sessionImage?.setAttribute("title", session.albumName || "")
    if (title != null) title.textContent = session.title || ""
    if (artist != null) artist.textContent = session.artist || ""

    this.updateMediaSessionState({
      isActive: session.isPlaying,
      position: session.position,
      duration: session.duration,
      token
    })
  }

  private createSessionElement(session: MediaSession) {
    const token = session.token
    const element = Public.createElement({
      clss: "session",
      id: "session-" + token,
      children: [
        this.getImage(session.albumArt, session.albumName, token),
        this.getSessionInfo(session),
        this.getSessionControls(session)
      ]
    })

    this.container?.appendChild(element)
  }

  private getSessionControls(session: MediaSession): HTMLElement | undefined {
    return Public.createElement({
      clss: `session-controls ${session.isPlaying ? 'playing' : ''}`,
      id: "session-control-" + session.token,
      children: [
        this.getProgressBar(session.position, session.duration, session.token),
        this.getActions(session.token)
      ]
    })
  }

  private getActions(token: string): HTMLElement | undefined {
    return Public.createElement({
      clss: "session-actions",
      children: [
        this.getAction("action-previous", this.svg.previous, "skipToPrevious", token),
        Public.createElement({
          clss: "actions-play-pause", children: [
            this.getAction("action-play", this.svg.play, "play", token),
            this.getAction("action-pause", this.svg.pause, "pause", token)
          ]
        }),
        this.getAction("action-next", this.svg.next, "skipToNext", token),
      ]
    })
  }

  private getAction(clss: string, icon: string, action: string, token: string): HTMLElement | undefined {
    const callback = () => { this.sendAction(token, action) }
    return Public.createElement({
      clss,
      listener: {
        event: "click",
        callback
      },
      innerHtml: icon
    })
  }

  private getProgressBar(position?: number, duration?: number, token?: string): HTMLElement | undefined {
    if (duration != undefined && position != undefined) {
      const progressBar = Public.createElement({ clss: "session-progress-bar", id: "session-progress-bar-" + token })
      const startRatio = (100 * position) / duration
      const remainDuration = (duration - position) / 1000

      progressBar.addEventListener("click", (ev: MouseEvent) => {
        const rect = progressBar.getBoundingClientRect()
        const x = ev.clientX - rect.left
        const xPercent = (x / rect.width) * 100
        if (xPercent > 0 && xPercent < 100) {
          const position = Math.floor((xPercent / 100) * duration)
          console.log(position)
          this.sendAction(token, "seekTo", position.toString())
        }
      })

      progressBar.setAttribute("style", `--startPoint: ${startRatio}%; --duration: ${remainDuration}s;`)
      return progressBar
    }
    return
  }
  private getSessionInfo(session: MediaSession): HTMLElement | undefined {
    return Public.createElement({
      clss: "session-info",
      children: [
        Public.createElement({ clss: "session-title", id: "session-title-" + session.token, content: session.title }),
        Public.createElement({ clss: "session-artist", id: "session-artist-" + session.token, content: session.artist })
      ]
    })
  }

  private getImage(art: string | undefined, albumName: string | undefined, token: string): HTMLElement | undefined {
    const image = Public.createElement({
      clss: "session-image",
      id: "session-image-" + token,
      type: "img", title: albumName
    })
    image.setAttribute("src", art ? Public.base64head + art : "")
    return image
  }

  private sendAction(token: string | undefined, action: string, value: any = 0) {
    Socket.send("MediaSessionControl", { token, action, value })
  }
}