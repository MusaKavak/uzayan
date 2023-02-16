import { Socket } from "../connection/Socket";
import { MediaSession } from "../types/MediaSession";
import { MediaSessionControl } from "../types/MediaSessionControl";

export class MediaSessionManager {
  private container: HTMLElement | null = document.getElementById("media-session-slider")

  createMediaSessions(sessions: MediaSession[]) {
    if (sessions.length == 0) {
      document.querySelectorAll(".controls").forEach(e => e.classList.remove("playing"))
    } else if (this.container != null) {
      this.container.innerHTML = ""
      sessions.sort((a, b) => a.token > b.token ? 1 : -1)
      sessions.forEach(s => this.createSessionElement(s))
    }
  }


  updateMediaSession(session: MediaSession) {
    this.setImage(session.token, session.albumArt, session.albumName)
    const title = document.getElementById(`tl-${session.token}`)
    const artist = document.getElementById(`a-${session.token}`)
    const controls = document.getElementById(`c-${session.token}`)
    if (title != null && artist != null) {
      title.textContent = session.title || '-'
      artist.textContent = session.artist || '-'
    }
    if (session.isPlaying) controls?.classList.add("playing")
    else controls?.classList.remove("playing")
  }

  private createSessionElement(session: MediaSession) {
    const token = session.token
    const element = `
        <div class="session" id="t-${token}">
          <img class="session-image" id="i-${token}">
          <div class="session-info">
            <div class="session-title" id="tl-${token}">${session.title || '-'}</div>
            <div class="session-artist" id="a-${token}">${session.artist || '-'}</div>
          </div>
          <div class="controls ${session.isPlaying ? 'playing' : ''}" id="c-${token}">
              <div class="previous">
                <svg width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000"
                    d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.592 30.592 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.592 30.592 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0z" />
                </svg>
              </div>
              <div class="play-pause">
                <div class="play"><svg width="800px" height="800px" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 11.9999V8.43989C4 4.01989 7.13 2.2099 10.96 4.4199L14.05 6.1999L17.14 7.9799C20.97 10.1899 20.97 13.8099 17.14 16.0199L14.05 17.7999L10.96 19.5799C7.13 21.7899 4 19.9799 4 15.5599V11.9999Z"
                      stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg></div>
                <div class="pause">
                  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.65 19.11V4.89C10.65 3.54 10.08 3 8.64 3H5.01C3.57 3 3 3.54 3 4.89V19.11C3 20.46 3.57 21 5.01 21H8.64C10.08 21 10.65 20.46 10.65 19.11Z"
                      stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path
                      d="M21 19.11V4.89C21 3.54 20.43 3 18.99 3H15.36C13.93 3 13.35 3.54 13.35 4.89V19.11C13.35 20.46 13.92 21 15.36 21H18.99C20.43 21 21 20.46 21 19.11Z"
                      stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
              <div class="next">
                <svg width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#000000"
                    d="M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z" />
                </svg>
              </div>
            </div>
        </div>
        `
    this.container?.insertAdjacentHTML("beforeend", element)
    this.setImage(token, session.albumArt, session.albumName)
    this.setControls(token)
  }

  private setImage(token: string | undefined, art: string | undefined, name: string | undefined) {
    const image = document.getElementById(`i-${token}`)
    image?.setAttribute("src", art ? "data:image/jpg;base64, " + art : "")
    image?.setAttribute("title", name || "")
  }

  private setControls(token: string | undefined) {
    const controls = document.getElementById("c-" + token)
    if (controls != null) {
      controls.children[0].addEventListener("click", () => this.sendAction(token, "3"))
      controls.children[1].children[0].addEventListener("click", () => this.sendAction(token, "1"))
      controls.children[1].children[1].addEventListener("click", () => this.sendAction(token, "0"))
      controls.children[2].addEventListener("click", () => this.sendAction(token, "2"))
    }
  }

  private sendAction(token: string | undefined, action: string) {
    Socket.send("MediaSessionControl", { token, action } as MediaSessionControl, "192.168.1.105:34724")
  }
}