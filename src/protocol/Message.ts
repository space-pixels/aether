import { Constructor, Message } from 'protobufjs/light'

export interface MessageHandlerTarget {
  messageHandlers: Map<string, MessageHandler>
}

export type MessageHandlerCallback<T extends Message = Message> = (message: T, session?: object) => void

export interface MessageConstructor<T extends Message = Message> extends Constructor<T> {
  $type: { name: string, decode: (data: Uint8Array) => T }
}

export interface MessageHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  callback: MessageHandlerCallback<T>
}

export function OnMessage<T extends Message>(type: MessageConstructor<T>) {
  return function (target: MessageHandlerTarget, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target.messageHandlers) { target.messageHandlers = new Map() }
    target.messageHandlers.set(type.$type.name, { type, callback: descriptor.value })
  }
}
