import { OnMessage } from '../../protocol/Message'
import { OnTransaction } from '../../protocol/Transaction'
import { Server } from '../../Server'
import { ExampleRequest } from '../protocol/ExampleRequest'
import { ExampleResponse } from '../protocol/ExampleResponse'
import { ExampleState } from '../protocol/ExampleState'
import { ExampleTransaction } from '../protocol/ExampleTransaction'

export class ExampleServer extends Server<object> {
  onOpen(session: object) {
    console.info(`~> [ExampleServer] session connected`)
  }

  @OnMessage(ExampleState) onExampleState(state: ExampleState, session: object) {
    console.info(`~> [ExampleServer] received ExampleState`)
    this.send(session, new ExampleState({ name: state.name, enabled: false }))
    this.send(session, new ExampleState({ name: state.name, enabled: true }))
    this.send(session, new ExampleState({ name: state.name, enabled: false }))
    this.send(session, new ExampleState({ name: state.name, enabled: true }))
    this.send(session, new ExampleState({ name: state.name, enabled: false }))
  }

  @OnTransaction(ExampleTransaction) async onExampleRequest(request: ExampleRequest, session: object) {
    console.info(`~> [ExampleServer] session requests ExampleRequest`)
    return new ExampleResponse({ message: `Responding to ${request.message}` })
  }

  onClose(session: object) {
    console.info(`~> [ExampleServer] session disconnected`)
  }
}
