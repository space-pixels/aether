import { Constructor, Message } from 'protobufjs/light'
import { AetherSide, Target } from '../decorators/Listener'

export type MessageHandlerCallback<T extends Message = Message> = (message: T, session?: object) => void

export interface MessageHandler<T extends Message = Message> {
  target?: Target
  type: MessageConstructor<T>
  side: AetherSide
  callback: MessageHandlerCallback<T>
  destroy: () => void
}

export interface MessageConstructor<T extends Message = Message> extends Constructor<T> {
  $type: { name: string, decode: (data: Uint8Array) => T }
}
