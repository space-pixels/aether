import { ICloseEvent, w3cwebsocket as WebsocketClient } from 'websocket'
import { Package } from '../protocol/Package'
import { Connection } from './Connection'
import { ConnectionDelegate } from './ConnectionDelegate'

export class W3CWebsocketConnection implements Connection {
  public delegate!: ConnectionDelegate
  public ws!: WebsocketClient

  setDelegate(delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  connect(uri: string) {
    return new Promise<void>((resolve) => {
      this.ws = new WebsocketClient(uri)
      this.ws.binaryType = 'arraybuffer'
      this.ws.onopen = () => {
        if (this.delegate.onOpen) { this.delegate.onOpen() }
        resolve()
      }
      this.ws.onmessage = (event) => {
        const data = event.data as Uint8Array
        debugger
        const pkg = Package.decode(data)
        this.delegate.onMessage(pkg)
      }
      this.ws.onclose = ({ code, reason }: ICloseEvent) => {
        if (this.delegate.onClose) { this.delegate.onClose(code, reason) }
      }
      this.ws.onerror = (error) => {
        if (this.delegate.onError) { this.delegate.onError(error) }
      }
    })
  }

  public send(pkg: Package): void {
    this.ws.send(pkg.encode())
  }

  public close(code: number, description?: string) {
    this.ws.close(code, description)
  }
}
