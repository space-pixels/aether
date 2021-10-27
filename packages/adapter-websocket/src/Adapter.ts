import { App, AppOptions, HttpRequest, HttpResponse, SSLApp, TemplatedApp, us_socket_context_t, WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { Socket } from './Socket'

export interface Client<S = any> {
  userId: string
  state?: S
  send(data: ArrayBuffer): void
}

export interface AdapterDelegate {
  onOpen(client: Client): void
  onMessage(client: Client, data: ArrayBuffer): void
  onClose(client: Client): void
}

export interface Adapter<T extends Client> {
  clients: T[]
  setDelegate(delegate: AdapterDelegate): void
  connect(): Promise<void>
}

export interface AdapterOptions {
  wsPath: string
  host: string
  port: number
  behavior?: WebSocketBehavior
  app: AppOptions
}

export class WebsocketAdapter implements Adapter<Socket> {
  public delegate!: AdapterDelegate
  public clients: Socket[] = []
  private app: TemplatedApp

  constructor(public options: AdapterOptions) {
    this.app = options.app.cert_file_name ? SSLApp(options.app) : App(options.app)
    this.app.ws(options.wsPath, {
      ...options.behavior,
      upgrade: (res: HttpResponse, req: HttpRequest, context: us_socket_context_t) => {
        const headers: { [id: string]: string } = {}
        req.forEach((key, value) => headers[key] = value)
        res.upgrade({
          url: req.getUrl(),
          query: req.getQuery(),
          headers,
          connection: { remoteAddress: Buffer.from(res.getRemoteAddressAsText()).toString() }
        }, req.getHeader('sec-websocket-key'), req.getHeader('sec-websocket-protocol'), req.getHeader('sec-websocket-extensions'), context)
      },
      open: (ws: WebSocket) => {
        const userId = ws.url.match(/^\/game\/(.+)$/)[1]
        const client = new Socket(ws, userId)
        this.clients.push(client)
        this.delegate.onOpen(client)
      },
      message: (ws: WebSocket, data: ArrayBuffer) => {
        const clients = this.clients.find((entry) => entry.ws === ws)
        if (!clients) { return }
        this.delegate.onMessage(clients, data)
      },
      close: (ws: WebSocket) => {
        const client = this.clients.find((entry) => entry.ws === ws)
        if (!client) { return }
        this.clients.splice(this.clients.indexOf(client), 1)
        this.delegate.onClose(client)
      }
    })
  }

  setDelegate(delegate: AdapterDelegate) {
    this.delegate = delegate
  }

  connect() {
    return new Promise<void>((resolve, reject) => {
      this.app.listen(this.options.port, (socket) => {
        if (socket) {
          resolve()
        } else {
          reject(new Error(`Unable to listen to port ${this.options.port}`))
        }
      })
    })
  }
}
