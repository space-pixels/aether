import { Message } from 'protobufjs/light'
import { AdapterDelegate } from '.'
import { Adapter, Client } from './Adapter'
import { MessageHandler, MessageHandlerTarget } from './Message'
import { Packet } from './Packet'
import { Pool } from './Pool'
import { TransactionHandler, TransactionHandlerTarget } from './Transaction'

export abstract class Server<S> implements MessageHandlerTarget, TransactionHandlerTarget, AdapterDelegate {
  public messageHandlers!: Map<string, MessageHandler>
  public transactionHandlers!: Map<string, TransactionHandler>

  constructor(public adapter: Adapter<Client>) {
    adapter.setDelegate(this)
  }

  connect() {
    return this.adapter.connect()
  }

  pool() {
    return new Pool(new Set(this.adapter.clients))
  }

  abstract onOpen(client: Client<S>): void
  abstract onClose(client: Client<S>): void

  onMessage(client: Client<S>, data: ArrayBuffer) {
    const packetData = new Uint8Array(data)
    const packet = Packet.decode(packetData)
    if (packet.transactionId) {
      this.onMessageTransaction(client, packet)
    } else {
      this.onMessageDefault(client, packet)
    }
  }

  protected onMessageDefault(client: Client<S>, { name, bytes }: Packet) {
    const handler = this.messageHandlers?.get(name)
    if (!handler) { throw new Error(`no message handler defined for ${name}`) }
    const message = handler.type.$type.decode(bytes)
    handler.callback.call(this, client, message)
  }

  protected async onMessageTransaction(client: Client<S>, { name, bytes, transactionId }: Packet) {
    const handler = this.transactionHandlers?.get(name)
    if (!handler) { throw new Error(`no transaction handler defined for ${name}`) }
    const request = handler.requestType.$type.decode(bytes)
    const response = await handler.callback.call(this, request, client)
    this.send(client, response, transactionId)
  }

  send<T extends Message>(client: Client<S>, message: T, transactionId?: string) {
    const bytes = message.$type.encode(message).finish()
    const packet = new Packet({ name: message.$type.name, bytes, transactionId })
    const packetData = Packet.encode(packet).finish()
    client.send(packetData)
  }
}
