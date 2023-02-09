import { AndroidMediaSession } from "../types/AndroidTypes";

export class MediaSessionManager {
  private container: HTMLElement | null = document.getElementById("media-session-slider")

  createMediaSessions(sessions: AndroidMediaSession[]) {
    if (this.container != null) {
      this.container.innerHTML = ""
      sessions.sort((a, b) => {
        if (a.token != undefined && b.token != undefined) return a.token - b.token
        else return 0
      })
      sessions.forEach(s => this.createSessionElement(s))
    }
  }


  updateMediaSession(session: AndroidMediaSession) {
    this.setImage(session.token, session.albumArt, session.albumName)
    const title = document.getElementById(`tl-${session.token}`)
    const artist = document.getElementById(`a-${session.token}`)
    if (title != null && artist != null) {
      title.textContent = session.title || '-'
      artist.textContent = session.artist || '-'
    }
  }

  private createSessionElement(session: AndroidMediaSession) {
    const token = session.token
    const element = `
        <div class="session" id="t-${token}">
          <img class="session-image" id="i-${token}">
          <div class="session-info">
            <div class="session-title" id="tl-${token}">${session.title || '-'}</div>
            <div class="session-artist" id="a-${token}">${session.artist || '-'}</div>
          </div>
        </div>
        `
    this.container?.insertAdjacentHTML("beforeend", element)
    this.setImage(token, session.albumArt, session.albumName)

  }

  private setImage(token: number | undefined, art: string | undefined, name: string | undefined) {
    const image = document.getElementById(`i-${token}`)
    image?.setAttribute("src", "data:image/jpg;base64, " + art || "")
    image?.setAttribute("title", name || "")
  }
}