import { MessageConstructor } from '../protocol/Message'
import { Transaction } from '../protocol/Transaction'
import { Target } from './Listener'

export const SymOnTransaction = Symbol('AetherOnTransaction')

export function OnTransaction<T extends Transaction>([request, response]: T) {
  return function (target: any, propertyKey: string) {
    const Base = target as Target
    Base[SymOnTransaction] = Base[SymOnTransaction] || new Map()
    Base[SymOnTransaction]!.set(propertyKey, [request as MessageConstructor, response as MessageConstructor])
  }
}
