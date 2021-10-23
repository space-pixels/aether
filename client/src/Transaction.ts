import { Constructor, Message } from 'protobufjs/light'
import { MessageHandler } from '.'

export interface TransactionHandlerTarget {
  transactionHandlers: Map<string, MessageHandler>
}

export type Transaction<Req extends Message = Message, Res extends Message = Message> = [Constructor<Req>, Constructor<Res>]
