import { Message } from 'protobufjs/light'
import { Observable, Subscriber } from 'rxjs'
import { MessageConstructor, MessageHandler } from './Message'
import { Package } from './Package'

export enum AetherSide { CLIENT, SERVER }

export interface Aether {
  side: AetherSide
  subscribe<T extends typeof Message>(type: T, next: (value: InstanceType<T>) => void): void
  observe<T extends typeof Message>(type: T): Observable<InstanceType<T>>
}

export interface IAether {
  aether: Aether
}

export interface SubscriptionHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  side: AetherSide
  observable: Observable<T>
  subscribers: Subscriber<T>[]
}

export const symSide = Symbol('SYM_AETHER_SIDE')

export const messageHandlers: MessageHandler[] = []
export const subscriptionHandlers: SubscriptionHandler[] = []

export function triggerHandlers(side: AetherSide, pkg: Package, session?: object) {
  // Message Handlers
  for (const handler of messageHandlers.filter((handler) => {
    const target = handler.target as IAether
    return side === target.aether.side && handler.type.$type.name === pkg.name
  })) {
    handler.callback.call(handler.target, pkg.message, session)
  }

  // Subscription Handlers
  for (const handler of subscriptionHandlers.filter((handler) => side === handler.side && handler.type.$type.name === pkg.name)) {
    for (const subscriber of handler.subscribers) {
      subscriber.next(pkg.message)
    }
  }
}

export function AetherListener(side: AetherSide) {
  return function (constructor: Function) {
    const prototype: IAether = constructor.prototype
    prototype.aether = {
      side,
      subscribe<T extends typeof Message>(type: T, next: (value: InstanceType<T>) => void) {
        return this.observe(type).subscribe(next)
      },
      observe<T extends typeof Message>(type: T) {
        const handler: SubscriptionHandler = {
          type,
          side: AetherSide.CLIENT,
          subscribers: [],
          observable: new Observable((subscriber) => { handler.subscribers.push(subscriber) })
        }
        subscriptionHandlers.push(handler)
        return handler.observable as Observable<InstanceType<T>>
      }
    }
  }
}
