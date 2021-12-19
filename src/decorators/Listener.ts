import { Observable } from 'rxjs'
import { MessageConstructor } from '../protocol/Message'
import { messageHandlers } from '../util/handlers'
import { SymObserve } from './Observe'
import { SymOnMessage } from './OnMessage'

export enum AetherSide { CLIENT, SERVER }

export const SymSide = Symbol('AetherSide')

export interface Target {
  [SymSide]: AetherSide
  [SymOnMessage]?: Map<string, MessageConstructor>
  [SymObserve]?: Map<string, Observable<any>>
}

export function Listener(side: AetherSide) {
  return function <T extends { new(...args: any[]): {} }>(Base: T) {
    Base.prototype[SymSide] = side
    return class extends Base {
      constructor(...args: any[]) {
        super(...args)
        Base.prototype[SymOnMessage]?.forEach((type: MessageConstructor, propertyKey: string) => {
          messageHandlers.push({ type, side, callback: (...args: any[]) => { (this as any)[propertyKey](...args) } })
        })
      }
    }
  }
}
