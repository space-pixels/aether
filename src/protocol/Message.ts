import { Constructor, Message } from 'protobufjs/light'
import { IAether, messageHandlers } from './Listener'

export type MessageHandlerCallback<T extends Message = Message> = (message: T, session?: object) => void

export interface MessageHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  target: object | IAether
  callback: MessageHandlerCallback<T>
}

export interface MessageConstructor<T extends Message = Message> extends Constructor<T> {
  $type: { name: string, decode: (data: Uint8Array) => T }
}

export function OnMessage<M extends Message>(type: MessageConstructor<M>) {
  return function (target: IAether, propertyKey: string, descriptor: PropertyDescriptor) {
    messageHandlers.push({ type, target, callback: descriptor.value })
  }
}
