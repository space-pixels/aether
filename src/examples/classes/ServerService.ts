import { AetherSide, Listener, OnTransaction, ServerInstance, TransactionHandler } from '../..'
import { ExampleRequest } from '../protocol/ExampleRequest'
import { ExampleResponse } from '../protocol/ExampleResponse'
import { ExampleState } from '../protocol/ExampleState'
import { ExampleTransaction } from '../protocol/ExampleTransaction'
import { ExampleServer } from '../server/ExampleServer'

@Listener(AetherSide.SERVER)
export class ServerService {
  public transactionHandlers!: Map<string, TransactionHandler>

  @ServerInstance() server!: ExampleServer

  @OnTransaction(ExampleTransaction) async onExampleRequest(request: ExampleRequest, session: object) {
    console.info(`~> [ExampleServer] session requests ExampleRequest`, session)
    this.server.pool.send(new ExampleState({ name: 'FROMSERVER', enabled: true }))
    return new ExampleResponse({ message: `Responding to ${request.message}` })
  }
}
