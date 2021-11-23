import { Message } from 'protobufjs/light'
import { Observable, Subscriber } from 'rxjs'
import { v4 } from 'uuid'
import { Connection } from './connections/Connection'
import { ConnectionDelegate } from './connections/ConnectionDelegate'
import { MessageConstructor, MessageHandler, MessageHandlerTarget } from './protocol/Message'
import { Packet } from './protocol/Packet'
import { Transaction, TransactionHandlerTarget } from './protocol/Transaction'

export interface SubscriptionHandlerTarget {
  subscriptionHandlers: Map<string, SubscriptionHandler>
}

export interface SubscriptionHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  observable: Observable<T>
  subscribers: Subscriber<T>[]
}

export abstract class Client implements ConnectionDelegate, MessageHandlerTarget, TransactionHandlerTarget, SubscriptionHandlerTarget {
  public messageHandlers!: Map<string, MessageHandler>
  public transactionHandlers = new Map<string, MessageHandler>()
  public subscriptionHandlers = new Map<string, SubscriptionHandler>()

  abstract onOpen?(): void
  abstract onClose?(code: number, description?: string): void
  abstract onError?(error: Error): void

  constructor(public connection: Connection) {
    connection.setDelegate(this)
  }

  subscribe<T extends typeof Message>(type: T, next: (value: InstanceType<T>) => void) {
    return this.observe(type).subscribe(next)
  }

  observe<T extends typeof Message>(type: T): Observable<InstanceType<T>> {
    if (!this.subscriptionHandlers.has(type.$type.name)) { this.registerSubscriptionHandler(type) }
    const { observable } = this.subscriptionHandlers.get(type.$type.name)!
    return observable as Observable<InstanceType<T>>
  }

  send<T extends Message>(message: T) {
    const bytes = message.$type.encode(message).finish()
    const packet = new Packet({ name: message.$type.name, bytes })
    const data = Packet.encode(packet).finish()
    this.connection.send(data)
  }

  request<T extends Transaction>(transaction: T, request: InstanceType<T[0]>): Promise<InstanceType<T[1]>> {
    const transactionId = v4()
    const bytes = request.$type.encode(request).finish()
    const packet = new Packet({ name: request.$type.name, bytes, transactionId })
    const data = Packet.encode(packet).finish()
    this.connection.send(data)
    return this.awaitTransaction<InstanceType<T[1]>>(transactionId, transaction[1] as MessageConstructor)
  }

  onMessage(data: ArrayBuffer) {
    const packetData = new Uint8Array(data)
    const packet = Packet.decode(packetData)
    if (packet.transactionId) {
      if (this.transactionHandlers?.has(packet.transactionId)) {
        const { type, callback } = this.transactionHandlers!.get(packet.transactionId)!
        callback(type.$type.decode(packet.bytes))
      }
    } else {
      if (this.messageHandlers?.has(packet.name)) {
        const { type, callback } = this.messageHandlers!.get(packet.name)!
        callback.call(this, type.$type.decode(packet.bytes))
      }
      if (this.subscriptionHandlers?.has(packet.name)) {
        const { type, subscribers } = this.subscriptionHandlers.get(packet.name)!
        const message = type.$type.decode(packet.bytes)
        for (const subscriber of subscribers) {
          subscriber.next(message)
        }
      }
    }
  }

  private awaitTransaction<T extends Message<T>>(transactionId: string, type: MessageConstructor): Promise<T> {
    return new Promise((resolve) => {
      const callback = (response: Message) => { resolve(response as T) }
      this.transactionHandlers.set(transactionId, { type, callback })
    })
  }

  private registerSubscriptionHandler<T extends typeof Message>(type: T) {
    const subscriptionHandler: SubscriptionHandler = {
      type,
      subscribers: [],
      observable: new Observable((subscriber) => {
        subscriptionHandler.subscribers.push(subscriber)
      })
    }
    this.subscriptionHandlers.set(type.$type.name, subscriptionHandler)
  }
}
