import { MessageConstructor } from '../protocol/Message'
import { Transaction, TransactionHandler, TransactionHandlerTarget } from '../protocol/Transaction'

export function OnTransaction<T extends Transaction>(types: T) {
  return function (target: TransactionHandlerTarget<TransactionHandler>, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!target.transactionHandlers) { target.transactionHandlers = new Map() }
    const requestType = types[0] as MessageConstructor
    const responseType = types[1] as MessageConstructor
    target.transactionHandlers.set(requestType.$type.name, { requestType, responseType, callback: descriptor.value })
  }
}
