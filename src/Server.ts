import { Message } from 'protobufjs/light'
import { Adapter } from './adapters/Adapter'
import { AdapterDelegate } from './adapters/AdapterDelegate'
import { MessageHandler, MessageHandlerTarget } from './protocol/Message'
import { Package } from './protocol/Package'
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

  onMessage(pkg: Package, session: S,) {
    // const packetData = new Uint8Array(data)
    // const packet = Packet.decode(packetData)
    if (pkg.transactionId) {
      this.onMessageTransaction(pkg, session)
    } else {
      this.onMessageDefault(pkg, session)
    }
  }

  protected onMessageDefault({ name, message }: Package, session: S,) {
    const handler = this.messageHandlers?.get(name)
    if (!handler) { throw new Error(`no message handler defined for ${name}`) }
    handler.callback.call(this, message, session)
  }

  protected async onMessageTransaction({ name, message, transactionId }: Package, session: S,) {
    const handler = this.transactionHandlers?.get(name)
    if (!handler) { throw new Error(`no transaction handler defined for ${name}`) }
    const response = await handler.callback.call(this, message, session)
    this.send(session, response, transactionId)
  }

  send<T extends Message>(session: S, message: T, transactionId?: string) {
    const pkg = new Package(message, transactionId)
    this.adapter.send(pkg, session)
  }

  get pool() { return new Pool<S>(this.adapter) }
}
