export interface ConnectionDelegate {
  onOpen: (event: Event) => void
  onMessage: (event: MessageEvent) => void
  onClose: (event: CloseEvent) => void
  onError: (event: Event) => void
}

export interface ConnectionOptions {
  uri: string
}

export class Connection {
  ws!: WebSocket

  static async connect(options: ConnectionOptions, delegate: ConnectionDelegate) {
    const connection = new Connection(options, delegate)
    await connection.connect()
    return connection
  }

  constructor(private options: ConnectionOptions, private delegate: ConnectionDelegate) { }

  connect() {
    return new Promise<void>((resolve) => {
      this.ws = new WebSocket(this.options.uri)
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
  }
}
