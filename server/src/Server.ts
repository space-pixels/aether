import { App, AppOptions, HttpRequest, HttpResponse, SSLApp, TemplatedApp, us_socket_context_t, WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { Client } from './Client'
import { MessageHandler, MessageHandlerTarget } from './Message'
import { Packet } from './Packet'
import { Pool } from './Pool'
import { TransactionHandler, TransactionHandlerTarget } from './Transaction'

export interface ServerOptions {
  wsPath: string
  host: string
  port: number
  behavior?: WebSocketBehavior
  app: AppOptions
}

export abstract class Server<S> implements MessageHandlerTarget, TransactionHandlerTarget {
  private app: TemplatedApp
  private clients: Client[] = []
  public messageHandlers!: Map<string, MessageHandler>
  public transactionHandlers!: Map<string, TransactionHandler>

  constructor(private options: ServerOptions) {
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
      open: (socket: WebSocket) => {
        const userId = socket.url.match(/^\/game\/(.+)$/)[1]
        const client = new Client<S>(socket, userId)
        this.clients.push(client)
        this.onOpen(client)
      },
      message: (socket: WebSocket, buffer: ArrayBuffer) => {
        const client = this.clients.find((entry) => entry.socket === socket)
        if (!client) { return }
        const packetData = new Uint8Array(buffer)
        const packet = Packet.decode(packetData)
        if (packet.transactionId) {
          this.onTransaction(client, packet)
        } else {
          this.onMessage(client, packet)
        }
      },
      close: (socket: WebSocket) => {
        const client = this.clients.find((entry) => entry.socket === socket)
        if (!client) { return }
        this.clients.splice(this.clients.indexOf(client), 1)
        this.onClose(client)
      }
    })
  }

  connect() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.options.port, () => { resolve() })
    })
  }

  pool() {
    return new Pool(new Set(this.clients))
  }

  abstract onOpen(client: Client<S>): void
  abstract onClose(client: Client<S>): void

  protected onMessage(client: Client<S>, { name, bytes }: Packet) {
    const handler = this.messageHandlers?.get(name)
    if (!handler) { throw new Error(`no message handler defined for ${name}`) }
    const message = handler.type.$type.decode(bytes)
    handler.callback.call(this, client, message)
  }

  protected async onTransaction(client: Client<S>, { name, bytes, transactionId }: Packet) {
    const handler = this.transactionHandlers?.get(name)
    if (!handler) { throw new Error(`no transaction handler defined for ${name}`) }
    const request = handler.requestType.$type.decode(bytes)
    const response = await handler.callback.call(this, request, client)
    client.send(response, transactionId)
  }
}
