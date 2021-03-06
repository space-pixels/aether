import { client as WebsocketClient, connection as WebsocketSession } from 'websocket'
import { Package } from '../protocol/Package'
import { Connection } from './Connection'
import { ConnectionDelegate } from './ConnectionDelegate'

export class WebsocketConnection implements Connection {
  public delegate!: ConnectionDelegate
  public ws = new WebsocketClient()
  public session?: WebsocketSession

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
          const pkg = Package.decode(data.binaryData)
          this.delegate.onMessage(pkg)
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

  public send(pkg: Package): void {
    if (!this.session) { return }
    this.session.send(pkg.encode())
  }

  public close(code: number, description?: string) {
    if (!this.session) { return }
    this.session.close(code, description)
  }
}
