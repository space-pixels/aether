import { RecognizedString, WebSocket } from 'uWebSockets.js'
import { Client } from './Adapter'

export class Socket<S = any> implements Client {
  state?: S

  constructor(public ws: WebSocket, public userId: string) { }

  send(data: RecognizedString) {
    this.ws.send(data, true, false)
  }
}
