import { Message } from 'protobufjs/light'
import { MessageConstructor } from '../protocol/Message'
import { Target } from './Listener'

export const SymOnMessage = Symbol('AetherOnMessage')

export function OnMessage<M extends Message>(type: MessageConstructor<M>) {
  return function (target: any, propertyKey: string) {
    const Base = target as Target
    Base[SymOnMessage] = Base[SymOnMessage] || new Map()
    Base[SymOnMessage]!.set(propertyKey, type)
  }
}
