import { Observable } from 'rxjs'
import { MessageConstructor, MessageHandler, MessageHandlerCallback } from '../protocol/Message'
import { TransactionHandler, TransactionHandlerCallback } from '../protocol/Transaction'
import { messageHandlers, transactionHandlers } from '../util/handlers'
import { SymObserve } from './Observe'
import { SymOnMessage } from './OnMessage'
import { SymOnTransaction } from './OnTransaction'

export enum AetherSide { CLIENT, SERVER }

export const SymSide = Symbol('AetherSide')

export interface Target {
  [SymSide]: AetherSide
  [SymOnMessage]?: Map<string, MessageConstructor>
  [SymOnTransaction]?: Map<string, [MessageConstructor, MessageConstructor]>
  [SymObserve]?: Map<string, Observable<any>>
}

export function Listener(side: AetherSide) {
  return function <T extends { new(...args: any[]): {} }>(Base: T) {
    Base.prototype[SymSide] = side
    return class extends Base {
      constructor(...args: any[]) {
        super(...args)
        const target: Target = this as unknown as any
        target[SymOnMessage]?.forEach((type: MessageConstructor, propertyKey: string) => {
          const callback: MessageHandlerCallback = (...args: any[]) => { (this as any)[propertyKey](...args) }
          const handler: MessageHandler = {
            type, side, target, callback, destroy: () => {
              const index = messageHandlers.indexOf(handler)
              if (index !== -1) { messageHandlers.splice(index, 1) }
            }
          }
          messageHandlers.push(handler)
        })
        target[SymOnTransaction]?.forEach(([requestType, responseType]: [MessageConstructor, MessageConstructor], propertyKey: string) => {
          const callback: TransactionHandlerCallback = (...args: any[]) => { return (this as any)[propertyKey](...args) }
          const handler: TransactionHandler = {
            requestType, responseType, target, callback, destroy: () => {
              const index = transactionHandlers.indexOf(handler)
              if (index !== -1) { transactionHandlers.splice(index, 1) }
            }
          }
          transactionHandlers.push(handler)
        })
      }
    }
  }
}


export function destroyHandlers(side: AetherSide) {
  for (const handler of messageHandlers.filter((item) => item.side === side)) {
    handler.destroy()
  }
  if (side === AetherSide.SERVER) {
    for (const handler of transactionHandlers) {
      handler.destroy()
    }
  }
}

export function destroyListener(obj: object) {
  const target = obj as Target
  const side = target[SymSide]
  const messageMap = target[SymOnMessage]
  const transactionMap = target[SymOnTransaction]
  const observeMap = target[SymObserve]
  transactionHandlers.filter((handler) => handler.target === target).forEach((handler) => handler.destroy())
  messageHandlers.filter((handler) => handler.side === side && handler.target === target).forEach((handler) => handler.destroy())
}
