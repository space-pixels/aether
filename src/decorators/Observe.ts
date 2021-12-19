import { Message } from 'protobufjs/light'
import { Observable, Subscriber } from 'rxjs'
import { MessageConstructor } from '../protocol/Message'
import { subscriptionHandlers } from '../util/handlers'
import { AetherSide, SymSide, Target } from './Listener'

export const SymObserve = Symbol('AetherObserve')

export interface SubscriptionHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  side: AetherSide
  observable: Observable<T>
  subscribers: Subscriber<T>[]
}

export function Observe<M extends Message>(type: MessageConstructor<M>) {
  return function (target: any, propertyKey: string) {
    const Base = target as Target
    Base[SymObserve] = Base[SymObserve] || new Map()
    Object.defineProperty(target, propertyKey, {
      get() {
        if (!Base[SymObserve]!.has(propertyKey)) {
          const observable = new Observable<M>((subscriber) => { handler.subscribers.push(subscriber) })
          const handler: SubscriptionHandler = { type, side: Base[SymSide], observable: observable, subscribers: [] }
          subscriptionHandlers.push(handler)
          Base[SymObserve]!.set(propertyKey, handler.observable)
        }
        return Base[SymObserve]!.get(propertyKey)!
      }
    })
  }
}
