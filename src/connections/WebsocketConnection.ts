import { client as WebSocketClient, connection as Session } from 'websocket'
import { Connection } from './Connection'
import { ConnectionDelegate } from './ConnectionDelegate'

export class WebsocketConnection implements Connection {
  public delegate!: ConnectionDelegate
  public ws = new WebSocketClient()
  public session?: Session

  setDelegate(delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  connect(uri: string) {
    return new Promise<void>((resolve, reject) => {
      this.ws.on('connect', (session) => {
        this.session = session
        session.on('close', (code, description) => {
          if (this.delegate.onClose) { this.delegate.onClose(code, description) }
        })
        session.on('message', (data) => {
          if (data.type !== 'binary') { return }
          this.delegate.onMessage(data.binaryData)
        })
        session.on('error', (error) => {
          if (this.delegate.onError) { this.delegate.onError(error) }
        })
        if (this.delegate.onOpen) { this.delegate.onOpen() }
        resolve()
      })
      this.ws.on('connectFailed', reject)
      this.ws.connect(uri)
    })
  }

  public send(data: ArrayBuffer): void {
    if (!this.session) { return }
    this.session.send(data)
  }

  public close(code: number, description?: string) {
    if (!this.session) { return }
    this.session.close(code, description)
  }
}
