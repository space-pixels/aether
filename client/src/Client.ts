import { MessageConstructor, MessageHandler, MessageHandlerTarget, Packet, Transaction, TransactionHandlerTarget } from '@space-pixels/aether-core'
import { Message } from 'protobufjs/light'
import { Observable } from 'rxjs'
import { v4 } from 'uuid'
import { Connection, ConnectionDelegate } from './Connection'
import { Socket } from './Socket'
import { SubscriptionHandler, SubscriptionHandlerTarget } from './Subscription'

export abstract class Client implements ConnectionDelegate, MessageHandlerTarget, TransactionHandlerTarget, SubscriptionHandlerTarget {
  public messageHandlers!: Map<string, MessageHandler>
  public transactionHandlers = new Map<string, MessageHandler>()
  public subscriptionHandlers = new Map<string, SubscriptionHandler>()
  public socket!: Socket

  abstract onOpen(event: Event): void
  abstract onClose(event: CloseEvent): void
  abstract onError(event: Event): void

  constructor(private connection: Connection) {
    connection.setDelegate(this)
  }

  async connect(userId: string) {
    this.socket = new Socket(this, userId)
    await this.connection.connect(userId)
  }

  subscribe<T extends Message>(type: { $type: { name: string }, new(): T }, next: (value: T) => void) {
    const data = this.subscriptionHandlers.get(type.$type.name)
    if (!data) { throw new Error(`No subscription handler registered for ${type.name}`) }
    return data.observable.subscribe(next as (value: Message) => void)
  }

  registerSubscriptionHandler(type: MessageConstructor) {
    const subscriptionHandler: SubscriptionHandler = {
      type,
      subscribers: [],
      observable: new Observable((subscriber) => {
        subscriptionHandler.subscribers.push(subscriber)
      })
    }
    this.subscriptionHandlers.set(type.$type.name, subscriptionHandler)
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

  onMessage(event: MessageEvent) {
    const packetData = new Uint8Array(event.data)
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
}
