import { AetherSide } from '../decorators/Listener'
import { SubscriptionHandler } from '../decorators/Observe'
import { MessageHandler } from '../protocol/Message'
import { Package } from '../protocol/Package'

export const messageHandlers: MessageHandler[] = []
export const subscriptionHandlers: SubscriptionHandler[] = []

export function triggerHandlers(side: AetherSide, pkg: Package, session?: object) {
  // Message Handlers
  for (const handler of messageHandlers.filter((handler) => handler.side === side && handler.type.$type.name === pkg.name)) {
    handler.callback(pkg.message, session)
  }

  // Subscription Handlers
  for (const handler of subscriptionHandlers.filter((handler) => side === handler.side && handler.type.$type.name === pkg.name)) {
    for (const subscriber of handler.subscribers) {
      subscriber.next(pkg.message)
    }
  }
}
