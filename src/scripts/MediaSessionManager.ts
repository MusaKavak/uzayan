import { SessionSvg } from "../assets/session.svg";
import { Socket } from "../connection/Socket";
import { MediaSession } from "../types/MediaSession";
import { MediaSessionState } from "../types/MediaSessionState";
import { Public } from "./Public";

export class MediaSessionManager {
  private svg = new SessionSvg()
  private container: HTMLElement | null = document.getElementById("media-session-container")

  createMediaSessions(sessions: MediaSession[]) {
    if (sessions.length == 0) {
      document.querySelectorAll(".controls").forEach(e => e.classList.remove("playing"))
    } else if (this.container != null) {
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
      const startRatio = (100 * state.position) / state.duration
      const duration = (state.duration - state.position) / 1000
      progressBar.setAttribute("style", `--startPoint: ${startRatio}%; --duration: ${duration}s;`)
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

  getSessionControls(session: MediaSession): HTMLElement | undefined {
    return Public.createElement({
      clss: "session-controls",
      id: "session-control-" + session.token,
      children: [
        this.getProgressBar(session),
        this.getActions(session.token)
      ]
    })
  }

  getActions(token: string): HTMLElement | undefined {
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
        this.getAction("action-next", this.svg.next, "skipToNext", token)
      ]
    })
  }

  getAction(clss: string, icon: string, action: string, token: string): HTMLElement | undefined {
    const callback = () => { this.sendAction(token, action) }
    const actionElement = Public.createElement({
      clss, listener: {
        event: "click",
        callback
      }
    })
    actionElement.innerHTML = icon
    return actionElement
  }

  getProgressBar(session: MediaSession): HTMLElement | undefined {
    if (session.duration != undefined && session.position != undefined) {
      const progressBar = Public.createElement({ clss: "session-progress-bar", id: "session-progress-bar-" + session.token })
      const startRatio = (100 * session.position) / session.duration
      const duration = (session.duration - session.position) / 1000
      progressBar.setAttribute("style", `--startPoint: ${startRatio}%; --duration: ${duration}s;`)
      return progressBar
    }
    return
  }

  getSessionInfo(session: MediaSession): HTMLElement | undefined {
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

  private sendAction(token: string | undefined, action: string) {
    Socket.send("MediaSessionControl", { token, action })
  }
}