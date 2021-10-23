import { Constructor, Message } from 'protobufjs/light'
import { Client } from './Client'
import { MessageConstructor } from './Message'

export interface TransactionHandlerTarget {
  transactionHandlers: Map<string, TransactionHandler>
}

export type Transaction<Req extends Message = Message, Res extends Message = Message> = [Constructor<Req>, Constructor<Res>]

export type TransactionHandlerCallback<Req extends Message = Message, Res extends Message = Message> = (message: Req, client: Client) => Promise<Res>

export interface TransactionHandler<Req extends Message = Message, Res extends Message = Message> {
  requestType: MessageConstructor<Req>
  responseType: MessageConstructor<Res>
  callback: TransactionHandlerCallback<Req, Res>
}

export function OnTransaction<T extends Transaction>(types: T) {
  return function (target: TransactionHandlerTarget, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target.transactionHandlers) { target.transactionHandlers = new Map() }
    const requestType = types[0] as MessageConstructor
    const responseType = types[1] as MessageConstructor
    target.transactionHandlers.set(requestType.$type.name, { requestType, responseType, callback: descriptor.value })
  }
}
