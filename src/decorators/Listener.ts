import { Observable } from 'rxjs'
import { MessageConstructor, MessageHandlerCallback } from '../protocol/Message'
import { TransactionHandlerCallback } from '../protocol/Transaction'
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
        Base.prototype[SymOnMessage]?.forEach((type: MessageConstructor, propertyKey: string) => {
          const callback: MessageHandlerCallback = (...args: any[]) => { (this as any)[propertyKey](...args) }
          messageHandlers.push({ type, side, callback })
        })
        Base.prototype[SymOnTransaction]?.forEach(([requestType, responseType]: [MessageConstructor, MessageConstructor], propertyKey: string) => {
          const callback: TransactionHandlerCallback = (...args: any[]) => { return (this as any)[propertyKey](...args) }
          transactionHandlers.push({ requestType, responseType, callback })
        })
      }
    }
  }
}
