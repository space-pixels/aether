import { Message } from 'protobufjs/light'
import { v4 } from 'uuid'
import { Connection } from './connections/Connection'
import { ConnectionDelegate } from './connections/ConnectionDelegate'
import { setClientInstance } from './decorators/ClientInstance'
import { AetherSide } from './decorators/Listener'
import { MessageConstructor, MessageHandler } from './protocol/Message'
import { Package } from './protocol/Package'
import { Transaction } from './protocol/Transaction'
import { triggerHandlers } from './util/handlers'

export abstract class Client implements ConnectionDelegate {
  private transactions = new Map<string, MessageHandler>()

  abstract onOpen?(): void
  abstract onClose?(code: number, description?: string): void
  abstract onError?(error: Error): void

  constructor(public connection: Connection) {
    connection.setDelegate(this)
    setClientInstance(this)
  }

  send<T extends Message>(message: T) {
    const pkg = new Package(message)
    this.connection.send(pkg)
  }

  onMessage(pkg: Package) {
    if (pkg.transactionId && this.transactions.has(pkg.transactionId)) {
      const { callback } = this.transactions.get(pkg.transactionId)!
      callback(pkg.message)
    }
    triggerHandlers(AetherSide.CLIENT, pkg)
  }

  request<T extends Transaction, REQ extends InstanceType<T[0]>, RES extends InstanceType<T[1]>>(transaction: T, request: REQ): Promise<RES> {
    const transactionId = v4()
    const pkg = new Package(request, transactionId)
    this.connection.send(pkg)
    return new Promise((resolve) => {
      const callback = (response: Message) => { resolve(response as RES) }
      const handler: MessageHandler = {
        type: transaction[1] as MessageConstructor, side: AetherSide.CLIENT, callback, destroy: () => {
          this.transactions.delete(transactionId)
        }
      }
      this.transactions.set(transactionId, handler)
    })
  }

  destroy() {
    setClientInstance(undefined)
  }
}
