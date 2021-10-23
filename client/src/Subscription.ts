import { Message } from 'protobufjs/light'
import { Observable, Subscriber } from 'rxjs'
import { MessageConstructor } from './Message'

export interface SubscriptionHandlerTarget {
  subscriptionHandlers: Map<string, SubscriptionHandler>
}

export interface SubscriptionHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  observable: Observable<T>
  subscribers: Subscriber<T>[]
}
