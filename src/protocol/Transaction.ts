import { Constructor, Message } from 'protobufjs/light'
import { Target } from '../decorators/Listener'
import { MessageConstructor } from './Message'

export type Transaction<Req extends Message = Message, Res extends Message = Message> = [Constructor<Req>, Constructor<Res>]

export type TransactionHandlerCallback<Req extends Message = Message, Res extends Message = Message> = (message: Req, session?: object) => Promise<Res>

export interface TransactionHandler<Req extends Message = Message, Res extends Message = Message> {
  target: Target
  requestType: MessageConstructor<Req>
  responseType: MessageConstructor<Res>
  callback: TransactionHandlerCallback<Req, Res>
  destroy: () => void
}
