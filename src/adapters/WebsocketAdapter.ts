import { connection as Socket, IServerConfig, server as WebSocketServer } from 'websocket'
import { Adapter } from './Adapter'
import { AdapterDelegate } from './AdapterDelegate'

export class WebsocketAdapter implements Adapter<Socket> {
  public delegate!: AdapterDelegate
  public sessions: Socket[] = []
  private ws: WebSocketServer

  constructor(public options: IServerConfig) {
    this.ws = new WebSocketServer(options)
    this.ws.on('request', (request) => {
      const connection = request.accept()
      this.sessions.push(connection)
      if (this.delegate.onOpen) { this.delegate.onOpen(connection) }

      connection.on('message', (message) => {
        if (message.type !== 'binary') { return }
        this.delegate.onMessage(message.binaryData, connection)
      })

      connection.on('close', (code, description) => {
        this.sessions.splice(this.sessions.indexOf(connection), 1)
        if (this.delegate.onClose) { this.delegate.onClose(connection, code, description) }
      })
    })
  }

  setDelegate(delegate: AdapterDelegate) {
    this.delegate = delegate
  }

  send(connection: Socket, data: ArrayBuffer) {
    connection.send(data)
  }
}
