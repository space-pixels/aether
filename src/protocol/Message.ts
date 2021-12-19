import { Constructor, Message } from 'protobufjs/light'
import { AetherSide } from '../decorators/Listener'

export type MessageHandlerCallback<T extends Message = Message> = (message: T, session?: object) => void

export interface MessageHandler<T extends Message = Message> {
  type: MessageConstructor<T>
  side: AetherSide
  callback: MessageHandlerCallback<T>
}

export interface MessageConstructor<T extends Message = Message> extends Constructor<T> {
  $type: { name: string, decode: (data: Uint8Array) => T }
}
