import { Constructor, Message } from 'protobufjs/light'
import { MessageConstructor, MessageHandler } from './Message'

export interface TransactionHandlerTarget<T = MessageHandler> {
  transactionHandlers: Map<string, T>
}

export type Transaction<Req extends Message = Message, Res extends Message = Message> = [Constructor<Req>, Constructor<Res>]

export type TransactionHandlerCallback<Req extends Message = Message, Res extends Message = Message> = (message: Req, session?: object) => Promise<Res>

export interface TransactionHandler<Req extends Message = Message, Res extends Message = Message> {
  requestType: MessageConstructor<Req>
  responseType: MessageConstructor<Res>
  callback: TransactionHandlerCallback<Req, Res>
}
