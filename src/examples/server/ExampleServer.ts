import { Aether, AetherListener, AetherSide } from '../../protocol/Listener'
import { OnTransaction } from '../../protocol/Transaction'
import { Server } from '../../Server'
import { ExampleRequest } from '../protocol/ExampleRequest'
import { ExampleResponse } from '../protocol/ExampleResponse'
import { ExampleState } from '../protocol/ExampleState'
import { ExampleTransaction } from '../protocol/ExampleTransaction'

@AetherListener(AetherSide.SERVER)
export class ExampleServer extends Server<object> {
  public aether!: Aether

  onOpen(session: object) {
    console.info(`~> [ExampleServer] session connected`)
  }

  @OnTransaction(ExampleTransaction) async onExampleRequest(request: ExampleRequest, session: object) {
    console.info(`~> [ExampleServer] session requests ExampleRequest`)
    this.pool.send(new ExampleState({ name: 'FROMSERVER', enabled: true }))
    return new ExampleResponse({ message: `Responding to ${request.message}` })
  }

  onClose(session: object) {
    console.info(`~> [ExampleServer] session disconnected`)
  }
}
