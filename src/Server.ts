import { Message } from 'protobufjs/light'
import { Adapter } from './adapters/Adapter'
import { AdapterDelegate } from './adapters/AdapterDelegate'
import { MessageHandler, MessageHandlerTarget } from './protocol/Message'
import { Packet } from './protocol/Packet'
import { TransactionHandler, TransactionHandlerTarget } from './protocol/Transaction'
import { Pool } from './util/Pool'

export abstract class Server<S extends object> implements MessageHandlerTarget, TransactionHandlerTarget<TransactionHandler>, AdapterDelegate {
  public messageHandlers!: Map<string, MessageHandler>
  public transactionHandlers!: Map<string, TransactionHandler>

  constructor(public adapter: Adapter<S>) {
    adapter.setDelegate(this)
  }

  abstract onOpen?(session: S): void
  abstract onClose?(session: S): void

  onMessage(session: S, data: ArrayBuffer) {
    const packetData = new Uint8Array(data)
    const packet = Packet.decode(packetData)
    if (packet.transactionId) {
      this.onMessageTransaction(session, packet)
    } else {
      this.onMessageDefault(session, packet)
    }
  }

  protected onMessageDefault(session: S, { name, bytes }: Packet) {
    const handler = this.messageHandlers?.get(name)
    if (!handler) { throw new Error(`no message handler defined for ${name}`) }
    const message = handler.type.$type.decode(bytes)
    handler.callback.call(this, message, session)
  }

  protected async onMessageTransaction(session: S, { name, bytes, transactionId }: Packet) {
    const handler = this.transactionHandlers?.get(name)
    if (!handler) { throw new Error(`no transaction handler defined for ${name}`) }
    const request = handler.requestType.$type.decode(bytes)
    const response = await handler.callback.call(this, request, session)
    this.send(session, response, transactionId)
  }

  send<T extends Message>(session: S, message: T, transactionId?: string) {
    const bytes = message.$type.encode(message).finish()
    const packet = new Packet({ name: message.$type.name, bytes, transactionId })
    this.adapter.send(session, Packet.encode(packet).finish())
  }

  get pool() { return new Pool<S>(new Set(this.adapter.sessions)) }
}
