import { Message } from 'protobufjs/light'
import { Adapter } from './adapters/Adapter'
import { AdapterDelegate } from './adapters/AdapterDelegate'
import { AetherSide } from './decorators/Listener'
import { setServerInstance } from './decorators/ServerInstance'
import { } from './protocol/Message'
import { Package } from './protocol/Package'
import { transactionHandlers, triggerHandlers } from './util/handlers'
import { Pool } from './util/Pool'

export abstract class Server<S extends object> implements AdapterDelegate {
  public adapter: Adapter<S>

  constructor(adapter: Adapter<S>) {
    this.adapter = adapter
    adapter.setDelegate(this)
    setServerInstance(this)
  }

  abstract onOpen?(session: S): void
  abstract onClose?(session: S): void

  onMessage(pkg: Package, session: S,) {
    if (pkg.transactionId) {
      for (const handler of transactionHandlers.filter((handler) => handler.requestType.$type.name === pkg.name)) {
        handler.callback(pkg.message, session).then((response) => {
          this.send(session, response, pkg.transactionId)
        })
      }
    }
    triggerHandlers(AetherSide.SERVER, pkg, session)
  }

  send<T extends Message>(session: S, message: T, transactionId?: string) {
    const pkg = new Package(message, transactionId)
    this.adapter.send(pkg, session)
  }

  destroy() {
    setServerInstance(undefined)
  }

  get pool() { return new Pool<S>(this.adapter) }
}
