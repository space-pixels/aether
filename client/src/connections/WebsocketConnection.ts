import { Connection, ConnectionDelegate } from '../Connection'

export interface WebsocketOptions {
  host: string
  port: number
  path: string
  ssl: boolean
}

export class WebsocketConnection implements Connection {
  public delegate!: ConnectionDelegate
  public userId?: string
  public ws!: WebSocket

  constructor(public options: WebsocketOptions) { }

  setDelegate(delegate: ConnectionDelegate) {
    this.delegate = delegate
  }

  connect(userId: string) {
    this.userId = userId
    return new Promise<void>((resolve) => {
      this.ws = new WebSocket(`${this.options.ssl ? 'wss' : 'ws'}://${this.options.host}:${this.options.port}${this.options.path}/${userId}`)
      this.ws.binaryType = 'arraybuffer'
      this.ws.onopen = (event: Event) => {
        this.delegate.onOpen(event)
        resolve()
      }
      this.ws.onmessage = this.delegate.onMessage.bind(this.delegate)
      this.ws.onclose = this.delegate.onClose.bind(this.delegate)
      this.ws.onerror = this.delegate.onError.bind(this.delegate)
    })
  }

  public send(data: ArrayBuffer): void {
    this.ws.send(data)
  }

  public close(code?: number, reason?: string) {
    this.ws.close(code, reason)
    this.userId = undefined
  }
}
