import { SessionSvg } from "../assets/session.svg";
import Socket from "../connection/Socket";
import { MediaSession } from "../types/network/MediaSession";
import { MediaSessionState } from "../types/network/MediaSessionState";
import Public from "../utils/Public";

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
    const session = document.getElementById("session-" + state.token)
    const progressBar = document.getElementById("session-progress-bar-" + state.token)

    state.isActive ? session?.classList.add("playing") : session?.classList.remove("playing")

    if (progressBar && state.duration && state.position) {
      const newProgressBar = this.getProgressBar(state.token, state.duration, state.position)
      if (newProgressBar) progressBar.replaceWith(newProgressBar)
    } else progressBar?.remove()
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
      clss: `session ${session.isPlaying ? 'playing' : ''}`,
      id: "session-" + token,
      children: [
        this.getProgressBar(session.token, session.duration, session.position),
        this.getSessionContent(session, token),
        this.getSessionControls(session)
      ],
    })

    if (session.duration)
      element.onclick = (ev: MouseEvent) => this.setCurrentPosition(element, ev, session.duration!!, session.token)

    this.container?.appendChild(element)
  }

  private getSessionContent(session: MediaSession, token: string): HTMLElement {
    return Public.createElement({
      clss: "session-content",
      children: [
        this.getImage(session.albumArt, session.albumName, token),
        this.getSessionInfo(session),
      ]
    })
  }

  private getSessionControls(session: MediaSession): HTMLElement | undefined {
    return Public.createElement({
      clss: `session-controls`,
      id: "session-control-" + session.token,
      children: [
        //this.getProgressBar(session.position, session.duration, session.token),
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
    const actionElement = Public.createElement({
      clss,
      innerHtml: icon
    })
    actionElement.addEventListener("click", (event: MouseEvent) => {
      event.stopPropagation()
      this.sendAction(token, action)
    })
    return actionElement
  }

  private getProgressBar(token: string, duration?: number, position?: number): HTMLElement | undefined {
    if (!duration && !position) return

    const progressBar = Public.createElement({ clss: "session-progress-bar", id: "session-progress-bar-" + token })

    const startRatio = (100 * position!!) / duration!!
    const remainDuration = duration!! - position!!

    progressBar.setAttribute("style", `--start: ${startRatio}%; --duration: ${remainDuration}ms;`)
    return progressBar
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

  private setCurrentPosition(source: HTMLElement, ev: MouseEvent, duration: number, token: string) {
    const rect = source.getBoundingClientRect()
    const x = ev.clientX - rect.left
    const xPercent = (x / rect.width) * 100
    console.log(xPercent)
    if (xPercent > 0 && xPercent < 100) {
      const position = Math.floor((xPercent / 100) * duration)
      this.sendAction(token, "seekTo", position.toString())
    }
  }

  private sendAction(token: string | undefined, action: string, value: any = 0) {
    Socket.send("MediaSessionControl", { token, action, value })
  }
}