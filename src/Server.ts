import { Message } from 'protobufjs/light'
import { Adapter } from './adapters/Adapter'
import { AdapterDelegate } from './adapters/AdapterDelegate'
import { AetherSide } from './decorators/Listener'
import { } from './protocol/Message'
import { Package } from './protocol/Package'
import { TransactionHandler, TransactionHandlerTarget } from './protocol/Transaction'
import { triggerHandlers } from './util/handlers'
import { Pool } from './util/Pool'

export abstract class Server<S extends object> implements TransactionHandlerTarget<TransactionHandler>, AdapterDelegate {
  public adapter: Adapter<S>
  public transactionHandlers!: Map<string, TransactionHandler>

  constructor(adapter: Adapter<S>) {
    this.adapter = adapter
    adapter.setDelegate(this)
  }

  abstract onOpen?(session: S): void
  abstract onClose?(session: S): void

  onMessage(pkg: Package, session: S,) {
    if (pkg.transactionId) { this.onMessageTransaction(pkg, session) }
    triggerHandlers(AetherSide.SERVER, pkg, session)
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
