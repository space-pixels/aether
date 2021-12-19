import { AetherSide, Listener, OnTransaction, Server } from '../..'
import { ExampleRequest } from '../protocol/ExampleRequest'
import { ExampleResponse } from '../protocol/ExampleResponse'
import { ExampleState } from '../protocol/ExampleState'
import { ExampleTransaction } from '../protocol/ExampleTransaction'

@Listener(AetherSide.SERVER)
export class ExampleServer extends Server<object> {
  onOpen(session: object) {
    console.info(`~> [ExampleServer] session connected`, session)
  }

  @OnTransaction(ExampleTransaction) async onExampleRequest(request: ExampleRequest, session: object) {
    console.info(`~> [ExampleServer] session requests ExampleRequest`, session)
    this.pool.send(new ExampleState({ name: 'FROMSERVER', enabled: true }))
    return new ExampleResponse({ message: `Responding to ${request.message}` })
  }

  onClose(session: object) {
    console.info(`~> [ExampleServer] session disconnected`, session)
  }
}
