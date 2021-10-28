import { ICloseEvent, w3cwebsocket as WebsocketClient } from 'websocket'
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
        this.delegate.onMessage(event.data as ArrayBuffer)
      }
      this.ws.onclose = ({ code, reason }: ICloseEvent) => {
        if (this.delegate.onClose) { this.delegate.onClose(code, reason) }
      }
      this.ws.onerror = (error) => {
        if (this.delegate.onError) { this.delegate.onError(error) }
      }
    })
  }

  public send(data: ArrayBuffer): void {
    this.ws.send(data)
  }

  public close(code: number, description?: string) {
    this.ws.close(code, description)
  }
}
