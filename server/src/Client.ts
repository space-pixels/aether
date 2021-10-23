import { Message } from 'protobufjs/light'
import { WebSocket } from 'uWebSockets.js'
import { Packet } from './Packet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Client<S = any> {
  public userId: string
  public socket: WebSocket
  public state!: S

  constructor(socket: WebSocket, userId: string) {
    this.socket = socket
    this.userId = userId
  }

  send<T extends Message>(message: T, transactionId?: string) {
    const bytes = message.$type.encode(message).finish()
    const packet = new Packet({ name: message.$type.name, bytes, transactionId })
    const packetData = Packet.encode(packet).finish()
    this.socket.send(packetData, true, false)
  }
}
